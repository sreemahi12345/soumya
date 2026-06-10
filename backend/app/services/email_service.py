import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from datetime import datetime

from app.config import settings
from app.schemas.postgre import ReachoutCreate


def _build_html_body(payload: ReachoutCreate, submission_id: int) -> str:
    now = datetime.now().strftime("%B %d, %Y at %I:%M %p")
    phone = payload.phone or "—"
    address = payload.address or "—"

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Contact Submission</title>
</head>
<body style="margin:0;padding:0;background-color:#fdf6ee;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fdf6ee;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#92400e,#b45309);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:0.5px;">
                ✉️ New Contact Submission
              </h1>
              <p style="margin:8px 0 0;color:#fde68a;font-size:14px;">
                Received on {now}
              </p>
            </td>
          </tr>

          <!-- Submission ID badge -->
          <tr>
            <td style="background:#fffbeb;padding:16px 40px;border-bottom:1px solid #fde68a;">
              <p style="margin:0;font-size:13px;color:#78350f;">
                <strong>Submission ID:</strong>
                <span style="display:inline-block;background:#92400e;color:#fff;border-radius:20px;padding:2px 12px;font-size:12px;margin-left:8px;">#{submission_id}</span>
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">

                <!-- Name -->
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #fef3c7;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#92400e;font-weight:700;">Your Name</p>
                    <p style="margin:0;font-size:16px;color:#1c1917;font-weight:600;">{payload.name}</p>
                  </td>
                </tr>

                <!-- Email -->
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #fef3c7;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#92400e;font-weight:700;">Email Address</p>
                    <p style="margin:0;font-size:16px;color:#1c1917;">
                      <a href="mailto:{payload.email}" style="color:#b45309;text-decoration:none;">{payload.email}</a>
                    </p>
                  </td>
                </tr>

                <!-- Phone -->
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #fef3c7;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#92400e;font-weight:700;">Phone</p>
                    <p style="margin:0;font-size:16px;color:#1c1917;">{phone}</p>
                  </td>
                </tr>

                <!-- Address -->
                <tr>
                  <td style="padding:12px 0;border-bottom:1px solid #fef3c7;">
                    <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#92400e;font-weight:700;">Address</p>
                    <p style="margin:0;font-size:16px;color:#1c1917;">{address}</p>
                  </td>
                </tr>

                <!-- Message -->
                <tr>
                  <td style="padding:12px 0;">
                    <p style="margin:0 0 10px;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#92400e;font-weight:700;">Message</p>
                    <div style="background:#fffbeb;border-left:4px solid #b45309;border-radius:4px;padding:16px 20px;font-size:15px;color:#1c1917;line-height:1.7;white-space:pre-wrap;">{payload.message}</div>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Reply CTA -->
          <tr>
            <td style="padding:0 40px 36px;text-align:center;">
              <a href="mailto:{payload.email}"
                 style="display:inline-block;background:#92400e;color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:30px;font-size:15px;font-weight:600;letter-spacing:0.3px;">
                Reply to {payload.name}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#fef3c7;padding:20px 40px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#92400e;">
                This notification was sent automatically from the Sowmyakka contact form.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>"""


def _build_plain_body(payload: ReachoutCreate, submission_id: int) -> str:
    return (
        f"New contact form submission (#{submission_id})\n"
        f"{'=' * 40}\n"
        f"Name    : {payload.name}\n"
        f"Email   : {payload.email}\n"
        f"Phone   : {payload.phone or '—'}\n"
        f"Address : {payload.address or '—'}\n\n"
        f"Message:\n{payload.message}\n"
    )


def send_reachout_email(payload: ReachoutCreate, submission_id: int) -> None:
    recipient = settings.contact_receiver_email
    if not recipient:
        raise ValueError("CONTACT_RECEIVER_EMAIL is not configured in .env")

    msg = MIMEMultipart("alternative")
    msg["From"] = settings.smtp_username or recipient
    msg["To"] = recipient
    msg["Subject"] = f"New Contact from {payload.name}"

    msg.attach(MIMEText(_build_plain_body(payload, submission_id), "plain", "utf-8"))
    msg.attach(MIMEText(_build_html_body(payload, submission_id), "html", "utf-8"))

    smtp_password = settings.smtp_password.replace(" ", "") if settings.smtp_password else ""

    if settings.smtp_use_ssl:
        with smtplib.SMTP_SSL(settings.smtp_server, settings.smtp_port) as server:
            if settings.smtp_username and smtp_password:
                server.login(settings.smtp_username, smtp_password)
            server.send_message(msg)
        return

    with smtplib.SMTP(settings.smtp_server, settings.smtp_port) as server:
        if settings.smtp_use_tls:
            server.starttls()
        if settings.smtp_username and smtp_password:
            server.login(settings.smtp_username, smtp_password)
        server.send_message(msg)
