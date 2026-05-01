import API from "./api";

/* =====================================
   🔧 SAFE RESPONSE HANDLER
===================================== */
const handleResponse = (res) => res?.data?.data || res?.data;

/* =====================================
   🛒 CREATE ORDER
===================================== */
export const createOrder = async (orderData) => {
  if (!orderData?.materials?.length) {
    throw new Error("Materials required");
  }

  const res = await API.post("/orders/create-order", orderData);
  return handleResponse(res);
};

/* =====================================
   💳 VERIFY PAYMENT
===================================== */
export const verifyPayment = async (paymentData) => {
  if (!paymentData) {
    throw new Error("Payment data required");
  }

  const res = await API.post("/orders/verify-payment", paymentData);
  return handleResponse(res);
};

/* =====================================
   📥 GET PURCHASED MATERIALS (🔥 MATCH BACKEND)
===================================== */
export const getMyDownloads = async () => {
  const res = await API.get("/orders/my-materials");
  return handleResponse(res);
};