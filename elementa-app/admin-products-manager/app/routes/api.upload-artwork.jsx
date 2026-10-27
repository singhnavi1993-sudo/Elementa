import { json } from "@remix-run/node"; // or React Router 7 equivalent response

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS, GET",
  "Access-Control-Allow-Headers": "Content-Type, X-Shopify-Access-Token, Authorization",
};

export const loader = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }
  return new Response(JSON.stringify({ status: "Artwork Upload API Ready" }), {
    status: 200,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  });
};

async function getAdminAccessToken(shop) {
  // 1. Try env variable if set
  if (process.env.SHOPIFY_ADMIN_ACCESS_TOKEN) {
    return process.env.SHOPIFY_ADMIN_ACCESS_TOKEN;
  }

  // 2. Client credentials fallback
  const clientId = process.env.SHOPIFY_API_KEY || "";
  const clientSecret = process.env.SHOPIFY_API_SECRET || "";
  const shopDomain = shop || process.env.SHOP_CUSTOM_DOMAIN || "0fqeen-kj.myshopify.com";

  try {
    const res = await fetch(`https://${shopDomain}/admin/oauth/access_token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.access_token) return data.access_token;
    }
  } catch (err) {
    console.warn("Client credentials fetch error:", err);
  }

  // 3. Fallback to existing custom app token if configured
  return process.env.SHOPIFY_FALLBACK_TOKEN || "";
}

export const action = async ({ request }) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  if (request.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    });
  }

  try {
    const contentType = request.headers.get("content-type") || "";
    let fileBuffer = null;
    let filename = `artwork_${Date.now()}.png`;
    let mimeType = "image/png";

    if (contentType.includes("application/json")) {
      const body = await request.json();
      filename = body.filename || filename;
      mimeType = body.mimeType || mimeType;

      if (filename.toLowerCase().endsWith(".pdf")) {
        mimeType = "application/pdf";
      } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg") || mimeType === "image/jpg") {
        mimeType = "image/jpeg";
      }

      if (body.base64) {
        // Strip data URL header if present (e.g. data:image/png;base64,... or data:application/pdf;base64,...)
        const cleanBase64 = body.base64.replace(/^data:[^;]+;base64,/, "");
        fileBuffer = Buffer.from(cleanBase64, "base64");
      }
    } else if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      if (file && typeof file === "object" && file.name) {
        filename = file.name;
        mimeType = file.type || mimeType;
        if (filename.toLowerCase().endsWith(".pdf")) {
          mimeType = "application/pdf";
        } else if (filename.toLowerCase().endsWith(".jpg") || filename.toLowerCase().endsWith(".jpeg") || mimeType === "image/jpg") {
          mimeType = "image/jpeg";
        }
        const arrayBuffer = await file.arrayBuffer();
        fileBuffer = Buffer.from(arrayBuffer);
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return new Response(
        JSON.stringify({ error: "No valid file received" }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const shopDomain = "0fqeen-kj.myshopify.com";
    const token = await getAdminAccessToken(shopDomain);
    const fileSizeStr = fileBuffer.length.toString();

    // Step 1: Request Staged Upload Target from Shopify
    const stagedGql = {
      query: `
        mutation stagedUploadsCreate($input: [StagedUploadInput!]!) {
          stagedUploadsCreate(input: $input) {
            stagedTargets {
              url
              resourceUrl
              parameters {
                name
                value
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        input: [
          {
            resource: "FILE",
            filename,
            mimeType,
            fileSize: fileSizeStr,
            httpMethod: "POST",
          },
        ],
      },
    };

    const stagedRes = await fetch(`https://${shopDomain}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(stagedGql),
    });

    const stagedData = await stagedRes.json();
    const stagedTarget = stagedData?.data?.stagedUploadsCreate?.stagedTargets?.[0];
    const userErrors = stagedData?.data?.stagedUploadsCreate?.userErrors || [];

    if (!stagedTarget || userErrors.length > 0) {
      const errMsg = userErrors.map((e) => e.message).join(", ") || JSON.stringify(stagedData.errors || "Staged upload creation failed");
      return new Response(
        JSON.stringify({ error: errMsg, details: stagedData }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Step 2: Upload Binary directly to the Staged Bucket URL
    const uploadFormData = new FormData();
    for (const param of stagedTarget.parameters) {
      uploadFormData.append(param.name, param.value);
    }
    const blob = new Blob([fileBuffer], { type: mimeType });
    uploadFormData.append("file", blob, filename);

    const bucketUploadRes = await fetch(stagedTarget.url, {
      method: "POST",
      body: uploadFormData,
    });

    if (!bucketUploadRes.ok && bucketUploadRes.status !== 201 && bucketUploadRes.status !== 204) {
      const errText = await bucketUploadRes.text();
      return new Response(
        JSON.stringify({ error: "Failed to upload file to storage bucket", details: errText }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Step 3: Call fileCreate in Shopify to create the permanent CDN file
    const isPdf = mimeType === "application/pdf" || filename.toLowerCase().endsWith(".pdf");
    const isImage = !isPdf && (mimeType.startsWith("image/") || /\.(png|jpe?g|webp|gif|svg)$/i.test(filename));
    const targetContentType = isImage ? "IMAGE" : "FILE";

    const fileCreateGql = {
      query: `
        mutation fileCreate($files: [FileCreateInput!]!) {
          fileCreate(files: $files) {
            files {
              id
              fileStatus
              alt
              createdAt
              ... on GenericFile {
                url
              }
              ... on MediaImage {
                image {
                  url
                }
              }
            }
            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        files: [
          {
            originalSource: stagedTarget.resourceUrl,
            contentType: targetContentType,
            alt: `Custom Customer Upload - ${filename}`,
          },
        ],
      },
    };

    const fileCreateRes = await fetch(`https://${shopDomain}/admin/api/2024-01/graphql.json`, {
      method: "POST",
      headers: {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fileCreateGql),
    });

    const fileCreateData = await fileCreateRes.json();
    const createdFile = fileCreateData?.data?.fileCreate?.files?.[0];

    let finalCdnUrl = createdFile?.image?.url || createdFile?.url;

    // Step 4: If URL is not immediately populated (Shopify is still optimizing), poll once or return resourceUrl
    if (!finalCdnUrl && createdFile?.id) {
      await new Promise((r) => setTimeout(r, 1200));
      const pollGql = {
        query: `
          query getFileUrl($id: ID!) {
            node(id: $id) {
              ... on MediaImage {
                image {
                  url
                }
                status
              }
              ... on GenericFile {
                url
                status
              }
            }
          }
        `,
        variables: { id: createdFile.id },
      };

      const pollRes = await fetch(`https://${shopDomain}/admin/api/2024-01/graphql.json`, {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": token,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(pollGql),
      });

      const pollData = await pollRes.json();
      finalCdnUrl = pollData?.data?.node?.image?.url || pollData?.data?.node?.url;
    }

    // Fallback: If still processing, the resourceUrl is the permanent staging link
    if (!finalCdnUrl) {
      finalCdnUrl = stagedTarget.resourceUrl;
    }

    return new Response(
      JSON.stringify({
        success: true,
        url: finalCdnUrl,
        filename,
        fileId: createdFile?.id,
      }),
      { status: 200, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Upload error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal upload error" }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
};
