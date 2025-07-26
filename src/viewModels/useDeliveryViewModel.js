import { useState, useEffect } from 'react';
import { DeliveryRepository } from '../services/DeliveryRepository';
import { DeliveryInfo } from '../database/models/DeliveryInfo';

export const useDeliveryViewModel = () => {
  const [deliveryInfo, setDeliveryInfo] = useState(new DeliveryInfo());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});

  const loadDeliveryInfo = async () => {
    try {
      setLoading(true);
      setError(null);
      const info = await DeliveryRepository.getDeliveryInfo();
      setDeliveryInfo(info);
    } catch (err) {
      setError(err.message);
      console.error('Error loading delivery info:', err);
    } finally {
      setLoading(false);
    }
  };

  const saveDeliveryInfo = async (newDeliveryInfo) => {
    try {
      setLoading(true);
      setError(null);
      setValidationErrors({});

      // Validate the delivery info
      const validation = await DeliveryRepository.validateDeliveryInfo(newDeliveryInfo);
      
      if (!validation.isValid) {
        setValidationErrors(validation.errors);
        throw new Error('Please fix the validation errors');
      }

      const savedInfo = await DeliveryRepository.saveDeliveryInfo(newDeliveryInfo);
      console.log('DeliveryViewModel: Info saved, updating state:', savedInfo);
      setDeliveryInfo(savedInfo);
      return savedInfo;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateDeliveryInfo = async (updates) => {
    try {
      setLoading(true);
      setError(null);
      
      const updatedInfo = await DeliveryRepository.updateDeliveryInfo(updates);
      setDeliveryInfo(updatedInfo);
      return updatedInfo;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const validateField = async (fieldName, value) => {
    const tempInfo = { ...deliveryInfo.toJSON(), [fieldName]: value };
    const validation = await DeliveryRepository.validateDeliveryInfo(tempInfo);
    
    setValidationErrors(prev => ({
      ...prev,
      [fieldName]: validation.errors[fieldName] || null
    }));

    return !validation.errors[fieldName];
  };

  const clearValidationErrors = () => {
    setValidationErrors({});
  };

  const isDeliveryInfoComplete = () => {
    return deliveryInfo.isValid();
  };

  const hasDeliveryInfo = () => {
    const hasInfo = deliveryInfo.name.trim() !== '' && 
           deliveryInfo.phoneNumber.trim() !== '' && 
           deliveryInfo.address.trim() !== '';
    console.log('hasDeliveryInfo check:', { 
      name: deliveryInfo.name, 
      phone: deliveryInfo.phoneNumber, 
      address: deliveryInfo.address, 
      hasInfo 
    });
    return hasInfo;
  };

  useEffect(() => {
    loadDeliveryInfo();
  }, []);

  return {
    deliveryInfo,
    loading,
    error,
    validationErrors,
    saveDeliveryInfo,
    updateDeliveryInfo,
    loadDeliveryInfo,
    validateField,
    clearValidationErrors,
    isDeliveryInfoComplete,
    hasDeliveryInfo
  };
};
