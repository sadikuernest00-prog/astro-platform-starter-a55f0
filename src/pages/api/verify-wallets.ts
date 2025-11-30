import type { APIRoute } from "astro";
import { verifyMessage } from "ethers";

export const POST: APIRoute = async ({ request }) => {
  try {
    const { address, message, signature } = await request.json();

    if (!address || !message || !signature) {
      return new Response(
        JSON.stringify({ valid: false, error: "Missing fields." }),
        { status: 400 }
      );
    }

    // Recover signer address from the signed message
    const recovered = verifyMessage(message, signature);

    const isValid = recovered.toLowerCase() === address.toLowerCase();

    return new Response(
      JSON.stringify({ valid: isValid, recovered }),
      { status: 200 }
    );
  } catch (err: any) {
    return new Response(
      JSON.stringify({ valid: false, error: err.message }),
      { status: 500 }
    );
  }
};
