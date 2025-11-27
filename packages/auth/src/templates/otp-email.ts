export const buildOtpEmailHtml = (params: { otp: string; type: string }) => {
	const { otp, type } = params;
	const title =
		type === "sign-in"
			? "ACCESS CHANNEL TOKEN"
			: type === "email-verification"
				? "EMAIL VERIFICATION TOKEN"
				: "SECURITY TOKEN";
	const description =
		type === "sign-in"
			? "Use this one-time code to access your Studio+233 console."
			: "Use this code to verify your email for Studio+233.";
	return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f4f4f0;color:#111111;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background:#f4f4f0;padding:32px 0;">
      <tr>
        <td align="center">
          <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:520px;background:#f4f4f0;border:1px solid #e0e0dc;">
            <tr>
              <td style="padding:16px 20px;border-bottom:1px solid #e0e0dc;background:#f4f4f0;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="font-family:SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;font-size:11px;letter-spacing:0.25em;color:#ff4d00;text-transform:uppercase;">
                      STUDIO+233
                    </td>
                    <td align="right" style="font-family:SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;font-size:10px;color:#777777;text-transform:uppercase;">
                      AUTH_CHANNEL: EMAIL_OTP
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 20px 8px 20px;">
                <div style="font-family:SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;font-size:10px;letter-spacing:0.18em;color:#999999;text-transform:uppercase;margin-bottom:8px;">
                  ${title}
                </div>
                <h1 style="margin:0;font-size:18px;line-height:1.3;font-weight:800;color:#111111;">
                  Creative Operating System – Access Code
                </h1>
                <p style="margin:12px 0 0 0;font-size:13px;line-height:1.6;color:#555555;">
                  ${description}
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:20px;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="border:1px solid #deded8;background:#fafaf6;">
                  <tr>
                    <td style="padding:18px 20px;" align="center">
                      <div style="font-family:SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;font-size:10px;letter-spacing:0.25em;color:#999999;text-transform:uppercase;margin-bottom:8px;">
                        ONE-TIME CODE
                      </div>
                      <div style="display:inline-block;padding:10px 16px;border:1px solid #111111;background:#f4f4f0;">
                        <span style="font-family:SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;font-size:18px;letter-spacing:0.4em;color:#111111;">
                          ${otp}
                        </span>
                      </div>
                      <div style="margin-top:10px;font-family:SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;font-size:10px;color:#777777;text-transform:uppercase;">
                        VALID FOR A SINGLE SESSION
                      </div>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 20px 20px 20px;">
                <p style="margin:0 0 8px 0;font-size:11px;line-height:1.5;color:#777777;">
                  If you did not request this code, you can safely ignore this message.
                </p>
                <p style="margin:0;font-size:10px;line-height:1.5;color:#a0a0a0;font-family:SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;text-transform:uppercase;">
                  LOGGING: UNAUTHORIZED USE WILL BE RECORDED
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:10px 20px 14px 20px;border-top:1px solid #e0e0dc;">
                <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
                  <tr>
                    <td style="font-family:SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;font-size:9px;color:#999999;text-transform:uppercase;">
                      SECURE_CHANNEL: TLS_1.3
                    </td>
                    <td align="right" style="font-family:SFMono-Regular,Menlo,Consolas,'Liberation Mono',monospace;font-size:9px;color:#999999;text-transform:uppercase;">
                      STATUS: ACTIVE
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};
