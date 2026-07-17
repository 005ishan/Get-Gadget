const SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

let loaded = false;

async function loadReCaptcha(): Promise<void> {
  if (loaded || !SITE_KEY) return;
  return new Promise((resolve) => {
    if ((window as any).grecaptcha) {
      loaded = true;
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = `https://www.google.com/recaptcha/api.js?render=${SITE_KEY}`;
    script.onload = () => {
      loaded = true;
      resolve();
    };
    document.head.appendChild(script);
  });
}

export async function getCaptchaToken(action: string = "submit"): Promise<string | null> {
  if (!SITE_KEY) return null;
  await loadReCaptcha();
  try {
    const token = await (window as any).grecaptcha.execute(SITE_KEY, { action });
    return token;
  } catch {
    return null;
  }
}
