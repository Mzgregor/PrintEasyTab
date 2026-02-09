/**
 * Mock Email Service for Local Development
 * 
 * In production, replace this with a real email service like EmailJS or a backend API
 */

export interface EmailData {
    to: string;
    subject: string;
    activationLink: string;
}

/**
 * Generate a random activation token
 */
function generateActivationToken(): string {
    return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

/**
 * Send activation email (mock for local development)
 * 
 * @param email - User's email address
 * @param activationToken - Unique activation token
 * @returns Activation URL for display
 */
export function sendActivationEmail(email: string, activationToken: string): string {
    const baseUrl = window.location.origin;
    const activationUrl = `${baseUrl}/?activate=${activationToken}`;

    // Mock email content
    const emailContent = {
        to: email,
        subject: '🎸 Bienvenue sur One More Tab - Activez votre compte !',
        body: `
Bonjour et bienvenue sur One More Tab ! 🎵

Nous sommes ravis de vous compter parmi nous. Vous êtes à un clic de commencer à créer vos tablatures et paroles de chansons.

Pour activer votre compte, cliquez sur le lien ci-dessous :
${activationUrl}

Ce lien est valide pendant 24 heures.

Si vous n'avez pas créé de compte sur One More Tab, vous pouvez ignorer ce message.

À très bientôt,
L'équipe One More Tab

---
One More Tab - Vos tablatures, simplifiées.
        `.trim()
    };

    // Log to console with styling for easy visibility
    console.log('%c📧 EMAIL ENVOYÉ (MODE LOCAL)', 'background: #4CAF50; color: white; padding: 8px; font-weight: bold; border-radius: 4px;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50;');
    console.log(`%c✉️  À: ${emailContent.to}`, 'color: #2196F3; font-weight: bold;');
    console.log(`%c📋 Objet: ${emailContent.subject}`, 'color: #2196F3; font-weight: bold;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50;');
    console.log(`%c${emailContent.body}`, 'color: #666; line-height: 1.6;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50;');
    console.log('%c🔗 LIEN D\'ACTIVATION (cliquez pour copier):', 'background: #FF9800; color: white; padding: 4px 8px; font-weight: bold; border-radius: 4px;');
    console.log(`%c${activationUrl}`, 'color: #FF9800; font-size: 14px; font-weight: bold; text-decoration: underline; cursor: pointer;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50;');
    console.log('%c💡 En production, un vrai email serait envoyé à cette adresse.', 'color: #9E9E9E; font-style: italic;');
    console.log('%c━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'color: #4CAF50;');

    return activationUrl;
}

/**
 * Generate and export activation token
 */
export { generateActivationToken };
