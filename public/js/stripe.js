import axios from 'axios';
import { sendAlert } from './alerts';

export const bookTour = async (tourId) => {
  const stripe = Stripe(
    'pk_test_51HJ3OOFU8VajapjJ52gh772aPbxgEV6P5grwE8H4TPQak6Mwl0WbHm1GLEmMN2E7BdX7IKHOdMJXWFXj0vGkZTDK00z6MpDiua'
  );
  try {
    const session = await axios(`/api/v1/booking/session-checkout/${tourId}`);

    await stripe.redirectToCheckout({
      sessionId: session.data.session.id,
    });
  } catch (err) {
    console.log(err);
    sendAlert('error', err);
  }
};
