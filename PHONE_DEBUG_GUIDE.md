# Phone Number Checkout Debug Guide

## Issues Found and Fixed

### 1. Field Name Mismatch ✅ FIXED
**Problem**: DeliveryInfo model uses `phoneNumber` but checkout code was accessing `phone`
**Fixed in**:
- `src/presentation/screens/CartScreen.js` (line ~130)
- `src/domain/models/Order.js` (fromCartAndDelivery method)

### 2. Enhanced Phone Validation ✅ ADDED
**Added validation in**:
- `src/domain/models/Order.js` - validates phone format during order validation
- `src/domain/models/DeliveryInfo.js` - validates phone during delivery info validation

### 3. Debug Logging ✅ ADDED
**Added comprehensive logging in**:
- `src/data/repositories/CheckoutRepository.js` - logs input data and order creation
- `src/domain/models/CheckoutModels.js` - logs phone number formatting
- `src/utils/debugCheckout.js` - temporary debug helper

## How to Debug

### Step 1: Check Console Logs
After trying checkout, check the React Native console for these logs:
```
=== CHECKOUT DEBUG INFO ===
1. DELIVERY INFO:
   - phoneNumber: [should show the phone number]
   - isValidPhoneNumber(): [should be true]
2. CUSTOMER INFO:
   - phone: [should match phoneNumber above]
4. PHONE NUMBER TESTS:
   - regex test: [should be true]
```

### Step 2: Common Phone Number Issues
Check if your phone number:
- ✅ Has 7-15 digits
- ✅ Starts with a digit (1-9) or + for international
- ✅ Only contains: digits, spaces, dashes, parentheses, plus sign
- ❌ Has letters or special characters
- ❌ Is too short (< 7 digits) or too long (> 15 digits)

### Step 3: Valid Phone Number Examples
```
✅ Valid formats:
- "1234567890"
- "+1234567890"
- "(123) 456-7890"
- "123-456-7890"
- "123 456 7890"
- "+1 (123) 456-7890"

❌ Invalid formats:
- "123"           (too short)
- "abc123def"     (contains letters)
- "12345678901234567" (too long)
- ""              (empty)
```

### Step 4: Test Delivery Info
Before checkout, make sure:
1. Open delivery info modal
2. Enter a valid phone number
3. Save the delivery info
4. Check that `hasDeliveryInfo()` returns true

### Step 5: API Error Details
If still failing, check the exact error message:
- Look for "Order validation failed" (client-side validation)
- Look for server error messages from the API
- Check network tab for API request/response

## Phone Number Processing Flow

```
1. User enters phone in DeliveryEditModal
   ↓
2. Saved as deliveryInfo.phoneNumber
   ↓
3. CartScreen extracts as customerInfo.phone
   ↓
4. Order.fromCartAndDelivery creates order.customerPhone
   ↓
5. Order.validate() checks phone format
   ↓
6. CheckoutRequest formats phone for API
   ↓
7. API receives formatted phone number
```

## Remove Debug Code Later
After fixing the issue, remove:
- Debug import in CartScreen.js
- debugCheckoutData() call in CartScreen.js
- Console.log statements (optional)

## Still Having Issues?
1. Copy the console logs from "=== CHECKOUT DEBUG INFO ==="
2. Check what the exact error message says
3. Verify the phone number format matches the valid examples
4. Make sure delivery info is completely filled out

The most likely issues are:
- Phone number format doesn't match validation regex
- Phone number field is empty or undefined
- Special characters in phone number that aren't allowed
