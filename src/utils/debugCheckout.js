// Debug helper for checkout issues
// Add this to your CartScreen temporarily to debug phone number issues

export const debugCheckoutData = (cartItems, deliveryInfo, customerInfo) => {
  console.log('=== CHECKOUT DEBUG INFO ===');
  
  console.log('1. DELIVERY INFO:');
  console.log('   - name:', deliveryInfo?.name);
  console.log('   - phoneNumber:', deliveryInfo?.phoneNumber);
  console.log('   - email:', deliveryInfo?.email);
  console.log('   - address:', deliveryInfo?.address);
  console.log('   - isValid():', deliveryInfo?.isValid?.());
  console.log('   - isValidPhoneNumber():', deliveryInfo?.isValidPhoneNumber?.());
  console.log('   - getFormattedPhoneNumber():', deliveryInfo?.getFormattedPhoneNumber?.());
  
  console.log('2. CUSTOMER INFO:');
  console.log('   - name:', customerInfo?.name);
  console.log('   - phone:', customerInfo?.phone);
  console.log('   - email:', customerInfo?.email);
  
  console.log('3. CART ITEMS:');
  console.log('   - count:', cartItems?.length);
  cartItems?.forEach((item, index) => {
    console.log(`   - item ${index + 1}:`, item?.name, '$' + item?.price, 'qty:', item?.quantity);
  });
  
  console.log('4. PHONE NUMBER TESTS:');
  const testPhones = [
    deliveryInfo?.phoneNumber,
    customerInfo?.phone,
    deliveryInfo?.getFormattedPhoneNumber?.()
  ];
  
  testPhones.forEach((phone, index) => {
    if (phone) {
      console.log(`   - phone ${index + 1}: "${phone}"`);
      console.log(`     - length: ${phone.length}`);
      console.log(`     - cleaned: "${phone.replace(/[^\d+]/g, '')}"`);
      console.log(`     - regex test: ${/^[\+]?[1-9]?[\d\s\-\(\)]{7,15}$/.test(phone.replace(/\s/g, ''))}`);
    }
  });
  
  console.log('========================');
};

// Usage: Add this line before processCheckout call in CartScreen.js:
// debugCheckoutData(cartItems, deliveryInfo, customerInfo);
