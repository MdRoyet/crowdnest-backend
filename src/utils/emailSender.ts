import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  if (!process.env.SMTP_USER) {
    console.log("[Email] SMTP not configured, skipping email to:", options.to);
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    console.log("[Email] Sent to:", options.to);
  } catch (error) {
    console.error("[Email] Failed to send:", error);
  }
};

// --- Email Templates ---

export const contributionApprovedEmail = (
  supporterName: string,
  campaignTitle: string,
  amount: number,
  creatorName: string,
) => ({
  subject: `Your contribution to "${campaignTitle}" was approved!`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 12px; text-align: center;">
        <h1 style="color: white; margin: 0;">CrowdNest</h1>
      </div>
      <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
        <h2 style="color: #0f172a;">Hi ${supporterName},</h2>
        <p style="color: #475569; line-height: 1.6;">
          Great news! Your contribution of <strong>${amount} credits</strong> to 
          <strong>"${campaignTitle}"</strong> has been approved by ${creatorName}.
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22C55E; margin: 20px 0;">
          <p style="margin: 0; color: #16a34a; font-weight: bold;">✓ Contribution Approved</p>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
            ${amount} credits have been deducted from your account.
          </p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Thank you for supporting this campaign!
        </p>
      </div>
      <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
        © 2026 CrowdNest. All rights reserved.
      </div>
    </div>
  `,
});

export const contributionRejectedEmail = (
  supporterName: string,
  campaignTitle: string,
  amount: number,
  creatorName: string,
) => ({
  subject: `Your contribution to "${campaignTitle}" was declined`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 12px; text-align: center;">
        <h1 style="color: white; margin: 0;">CrowdNest</h1>
      </div>
      <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
        <h2 style="color: #0f172a;">Hi ${supporterName},</h2>
        <p style="color: #475569; line-height: 1.6;">
          Your contribution of <strong>${amount} credits</strong> to 
          <strong>"${campaignTitle}"</strong> was declined by ${creatorName}.
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #F59E0B; margin: 20px 0;">
          <p style="margin: 0; color: #d97706; font-weight: bold;">↩ Credits Refunded</p>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
            ${amount} credits have been returned to your account.
          </p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          You can use these credits to support other campaigns.
        </p>
      </div>
      <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
        © 2026 CrowdNest. All rights reserved.
      </div>
    </div>
  `,
});

export const campaignApprovedEmail = (
  creatorName: string,
  campaignTitle: string,
) => ({
  subject: `Your campaign "${campaignTitle}" is now live!`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 12px; text-align: center;">
        <h1 style="color: white; margin: 0;">CrowdNest</h1>
      </div>
      <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
        <h2 style="color: #0f172a;">Hi ${creatorName},</h2>
        <p style="color: #475569; line-height: 1.6;">
          Congratulations! Your campaign <strong>"${campaignTitle}"</strong> has been approved and is now live on CrowdNest!
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22C55E; margin: 20px 0;">
          <p style="margin: 0; color: #16a34a; font-weight: bold;">✓ Campaign Approved</p>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
            Supporters can now discover and contribute to your campaign.
          </p>
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Share your campaign to get more backers!
        </p>
      </div>
      <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
        © 2026 CrowdNest. All rights reserved.
      </div>
    </div>
  `,
});

export const campaignRejectedEmail = (
  creatorName: string,
  campaignTitle: string,
) => ({
  subject: `Your campaign "${campaignTitle}" was not approved`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 12px; text-align: center;">
        <h1 style="color: white; margin: 0;">CrowdNest</h1>
      </div>
      <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
        <h2 style="color: #0f172a;">Hi ${creatorName},</h2>
        <p style="color: #475569; line-height: 1.6;">
          Unfortunately, your campaign <strong>"${campaignTitle}"</strong> was not approved at this time.
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #EF4444; margin: 20px 0;">
          <p style="margin: 0; color: #dc2626; font-weight: bold;">✗ Campaign Rejected</p>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
            Please review our guidelines and consider resubmitting.
          </p>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
        © 2026 CrowdNest. All rights reserved.
      </div>
    </div>
  `,
});

export const withdrawalApprovedEmail = (
  creatorName: string,
  credits: number,
  amount: number,
) => ({
  subject: `Your withdrawal of $${amount} has been approved`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 12px; text-align: center;">
        <h1 style="color: white; margin: 0;">CrowdNest</h1>
      </div>
      <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
        <h2 style="color: #0f172a;">Hi ${creatorName},</h2>
        <p style="color: #475569; line-height: 1.6;">
          Your withdrawal request has been processed successfully.
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #22C55E; margin: 20px 0;">
          <p style="margin: 0; color: #16a34a; font-weight: bold;">✓ Payment Processed</p>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
            <strong>${credits} credits</strong> → <strong>$${amount}</strong> has been transferred.
          </p>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
        © 2026 CrowdNest. All rights reserved.
      </div>
    </div>
  `,
});

export const newContributionEmail = (
  creatorName: string,
  supporterName: string,
  campaignTitle: string,
  amount: number,
) => ({
  subject: `New contribution of ${amount} credits to "${campaignTitle}"`,
  html: `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 30px; border-radius: 12px; text-align: center;">
        <h1 style="color: white; margin: 0;">CrowdNest</h1>
      </div>
      <div style="padding: 30px; background: #f8fafc; border-radius: 0 0 12px 12px;">
        <h2 style="color: #0f172a;">Hi ${creatorName},</h2>
        <p style="color: #475569; line-height: 1.6;">
          <strong>${supporterName}</strong> just contributed <strong>${amount} credits</strong> to your campaign <strong>"${campaignTitle}"</strong>!
        </p>
        <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #4F46E5; margin: 20px 0;">
          <p style="margin: 0; color: #4F46E5; font-weight: bold;">💰 New Contribution</p>
          <p style="margin: 5px 0 0; color: #64748b; font-size: 14px;">
            Don't forget to review and approve this contribution.
          </p>
        </div>
      </div>
      <div style="text-align: center; padding: 20px; color: #94a3b8; font-size: 12px;">
        © 2026 CrowdNest. All rights reserved.
      </div>
    </div>
  `,
});
