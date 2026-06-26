const nodemailer = require('nodemailer');

/* ─── Transporter ─── */
const createTransporter = () =>
  nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

/* ─── Role label helper ─── */
const roleLabel = (role) => ({
  owner:           'Admin',
  admin:           'Admin',
  project_manager: 'Project Manager',
  team_lead:       'Team Lead',
  member:          'Member',
  client:          'Client',
}[role] || role);

/* ─── Invite email ─── */
const sendInviteEmail = async ({ to, invitedBy, workspaceName, role, inviteLink }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured — skipping invite email. Set EMAIL_USER and EMAIL_PASS in .env');
    return { skipped: true };
  }

  const transporter = createTransporter();
  const label = roleLabel(role);

  const roleColors = {
    admin:           '#ef4444',
    owner:           '#ef4444',
    project_manager: '#6366f1',
    team_lead:       '#8b5cf6',
    member:          '#14b8a6',
    client:          '#94a3b8',
  };
  const roleColor = roleColors[role] || '#6366f1';

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Logo -->
          <tr>
            <td align="center" style="padding-bottom:28px;">
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#4f46e5;border-radius:10px;padding:10px 12px;">
                    <span style="color:white;font-size:18px;font-weight:700;letter-spacing:-0.5px;">Team<span style="opacity:0.8">Flow</span></span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">

              <!-- Top accent -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr><td height="4" style="background:#4f46e5;"></td></tr>
              </table>

              <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px 36px 32px;">

                <!-- Heading -->
                <tr>
                  <td style="padding-bottom:8px;">
                    <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;line-height:1.3;">
                      You're invited to join<br/><span style="color:#4f46e5;">${workspaceName}</span>
                    </h1>
                  </td>
                </tr>

                <!-- Sub -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
                      <strong style="color:#334155;">${invitedBy}</strong> has invited you to collaborate on TeamFlow.
                    </p>
                  </td>
                </tr>

                <!-- Role badge -->
                <tr>
                  <td style="padding-bottom:28px;">
                    <table cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding:6px 0 6px 0;">
                          <p style="margin:0 0 8px 0;font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.08em;">Your role</p>
                          <span style="display:inline-block;background:${roleColor}18;color:${roleColor};border:1px solid ${roleColor}30;border-radius:8px;padding:6px 14px;font-size:13px;font-weight:600;">
                            ${label}
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>

                <!-- CTA Button -->
                <tr>
                  <td style="padding-bottom:24px;">
                    <a href="${inviteLink}"
                       style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;font-size:14px;font-weight:600;padding:13px 28px;border-radius:10px;letter-spacing:0.01em;">
                      Accept Invitation →
                    </a>
                  </td>
                </tr>

                <!-- Divider -->
                <tr><td height="1" style="background:#f1f5f9;padding-bottom:20px;"></td></tr>

                <!-- Fallback link -->
                <tr>
                  <td style="padding-top:20px;">
                    <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                      If the button doesn't work, copy and paste this link:<br/>
                      <a href="${inviteLink}" style="color:#4f46e5;word-break:break-all;">${inviteLink}</a>
                    </p>
                    <p style="margin:12px 0 0;font-size:11px;color:#cbd5e1;">
                      This invite expires in 24 hours. If you didn't expect this, you can ignore this email.
                    </p>
                  </td>
                </tr>

              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding-top:24px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;">
                Sent via TeamFlow · The smarter way to manage projects
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  await transporter.sendMail({
    from: `"TeamFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: `You're invited to join ${workspaceName} on TeamFlow`,
    html,
    text: `${invitedBy} has invited you to join ${workspaceName} on TeamFlow as ${label}.\n\nAccept your invitation: ${inviteLink}\n\nThis invite expires in 24 hours.`,
  });

  return { sent: true };
};

/* ─── Credentials email (sent when admin/PM creates a member directly) ─── */
const sendCredentialsEmail = async ({ to, name, role, workspaceName, tempPassword, loginUrl }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured — skipping credentials email.');
    return { skipped: true };
  }

  const transporter = createTransporter();
  const label = roleLabel(role);
  const roleColors = {
    admin: '#ef4444', project_manager: '#6366f1',
    team_lead: '#8b5cf6', member: '#14b8a6',
  };
  const roleColor = roleColors[role] || '#6366f1';
  const url = loginUrl || `${process.env.CLIENT_URL}/login`;

  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
  <tr><td align="center" style="padding-bottom:28px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background:#4f46e5;border-radius:10px;padding:10px 12px;">
        <span style="color:white;font-size:18px;font-weight:700;">TeamFlow</span>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td height="4" style="background:#4f46e5;"></td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px;">
      <tr><td style="padding-bottom:6px;">
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;">
          Welcome to <span style="color:#4f46e5;">${workspaceName}</span>, ${name}!
        </h1>
      </td></tr>
      <tr><td style="padding-bottom:28px;">
        <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
          Your account has been created. Here are your login credentials:
        </p>
      </td></tr>

      <!-- Credentials box -->
      <tr><td style="padding-bottom:28px;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;">
              <span style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Your role</span><br/>
              <span style="display:inline-block;margin-top:4px;background:${roleColor}18;color:${roleColor};border:1px solid ${roleColor}30;border-radius:6px;padding:4px 10px;font-size:13px;font-weight:600;">${label}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 16px;border-bottom:1px solid #e2e8f0;">
              <span style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Email</span><br/>
              <span style="font-size:14px;color:#0f172a;font-weight:500;">${to}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:10px 16px;">
              <span style="font-size:11px;color:#94a3b8;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Password</span><br/>
              <span style="font-size:16px;font-family:monospace;font-weight:700;color:#4f46e5;letter-spacing:.05em;">${tempPassword}</span>
            </td>
          </tr>
        </table>
      </td></tr>

      <!-- CTA -->
      <tr><td style="padding-bottom:20px;">
        <a href="${url}" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;font-size:14px;font-weight:600;padding:13px 28px;border-radius:10px;">
          Sign in to TeamFlow →
        </a>
      </td></tr>

      <tr><td>
        <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
          You can change your password anytime from your Profile page after signing in.<br/>
          If you need a password reset, contact your workspace admin.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding-top:24px;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">Sent via TeamFlow · The smarter way to manage projects</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  await transporter.sendMail({
    from:    `"TeamFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your TeamFlow account is ready — ${workspaceName}`,
    html,
    text: `Hi ${name},\n\nYour TeamFlow account has been created.\n\nEmail: ${to}\nPassword: ${tempPassword}\nRole: ${label}\n\nSign in at: ${url}\n\nYou can change your password from your Profile page.`,
  });
  return { sent: true };
};

/* ─── Password reset email (sent when admin resets a member's password) ── */
const sendPasswordResetEmail = async ({ to, name, workspaceName, newPassword, loginUrl }) => {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.warn('⚠️  Email not configured — skipping password reset email.');
    return { skipped: true };
  }

  const transporter = createTransporter();
  const url = loginUrl || `${process.env.CLIENT_URL}/login`;

  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"/></head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 16px;">
<tr><td align="center">
<table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">
  <tr><td align="center" style="padding-bottom:28px;">
    <table cellpadding="0" cellspacing="0"><tr>
      <td style="background:#4f46e5;border-radius:10px;padding:10px 12px;">
        <span style="color:white;font-size:18px;font-weight:700;">TeamFlow</span>
      </td>
    </tr></table>
  </td></tr>

  <tr><td style="background:white;border-radius:16px;border:1px solid #e2e8f0;overflow:hidden;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td height="4" style="background:#f59e0b;"></td></tr>
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="padding:36px;">
      <tr><td style="padding-bottom:6px;">
        <h1 style="margin:0;font-size:22px;font-weight:700;color:#0f172a;">Password Reset</h1>
      </td></tr>
      <tr><td style="padding-bottom:24px;">
        <p style="margin:0;font-size:14px;color:#64748b;line-height:1.6;">
          Hi ${name}, your password for <strong style="color:#334155;">${workspaceName}</strong> has been reset by your admin.
        </p>
      </td></tr>

      <tr><td style="padding-bottom:28px;">
        <table width="100%" cellpadding="0" cellspacing="0"
          style="background:#fffbeb;border:1px solid #fde68a;border-radius:12px;">
          <tr><td style="padding:10px 16px;border-bottom:1px solid #fde68a;">
            <span style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Email</span><br/>
            <span style="font-size:14px;color:#0f172a;font-weight:500;">${to}</span>
          </td></tr>
          <tr><td style="padding:10px 16px;">
            <span style="font-size:11px;color:#92400e;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">New password</span><br/>
            <span style="font-size:16px;font-family:monospace;font-weight:700;color:#d97706;letter-spacing:.05em;">${newPassword}</span>
          </td></tr>
        </table>
      </td></tr>

      <tr><td style="padding-bottom:20px;">
        <a href="${url}" style="display:inline-block;background:#4f46e5;color:white;text-decoration:none;font-size:14px;font-weight:600;padding:13px 28px;border-radius:10px;">
          Sign in →
        </a>
      </td></tr>

      <tr><td>
        <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
          Once signed in, you can change this password from your Profile page.<br/>
          If you didn't request this, contact your workspace admin immediately.
        </p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td align="center" style="padding-top:24px;">
    <p style="margin:0;font-size:12px;color:#94a3b8;">Sent via TeamFlow · The smarter way to manage projects</p>
  </td></tr>
</table>
</td></tr>
</table>
</body></html>`;

  await transporter.sendMail({
    from:    `"TeamFlow" <${process.env.EMAIL_USER}>`,
    to,
    subject: `Your TeamFlow password has been reset`,
    html,
    text: `Hi ${name},\n\nYour TeamFlow password has been reset.\n\nEmail: ${to}\nNew password: ${newPassword}\n\nSign in at: ${url}`,
  });
  return { sent: true };
};

module.exports = { sendInviteEmail, sendCredentialsEmail, sendPasswordResetEmail };
