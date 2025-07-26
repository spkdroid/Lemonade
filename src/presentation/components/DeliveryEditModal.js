import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const DeliveryEditModal = ({ 
  visible, 
  onClose, 
  deliveryInfo, 
  onSave, 
  loading, 
  validationErrors 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    phoneNumber: '',
    email: '',
    address: '',
    city: '',
    zipCode: '',
    deliveryInstructions: ''
  });

  useEffect(() => {
    if (deliveryInfo) {
      setFormData({
        name: deliveryInfo.name || '',
        phoneNumber: deliveryInfo.phoneNumber || '',
        email: deliveryInfo.email || '',
        address: deliveryInfo.address || '',
        city: deliveryInfo.city || '',
        zipCode: deliveryInfo.zipCode || '',
        deliveryInstructions: deliveryInfo.deliveryInstructions || ''
      });
    }
  }, [deliveryInfo, visible]);

  const handleSave = async () => {
    try {
      await onSave(formData);
      if (Object.keys(validationErrors).length === 0) {
        onClose();
      }
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const updateField = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const renderInput = (field, label, placeholder, options = {}) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[
          styles.input,
          validationErrors[field] && styles.inputError
        ]}
        placeholder={placeholder}
        value={formData[field]}
        onChangeText={(value) => updateField(field, value)}
        {...options}
      />
      {validationErrors[field] && (
        <Text style={styles.errorText}>{validationErrors[field]}</Text>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialIcons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title}>Delivery Information</Text>
          <TouchableOpacity 
            onPress={handleSave} 
            style={styles.saveButton}
            disabled={loading}
          >
            <Text style={[
              styles.saveButtonText,
              loading && styles.saveButtonTextDisabled
            ]}>
              {loading ? 'Saving...' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            {renderInput('name', 'Full Name *', 'Enter your full name', {
              autoCapitalize: 'words'
            })}
            
            {renderInput('phoneNumber', 'Phone Number *', 'Enter your phone number', {
              keyboardType: 'phone-pad'
            })}
            
            {renderInput('email', 'Email Address *', 'Enter your email address', {
              keyboardType: 'email-address',
              autoCapitalize: 'none'
            })}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            
            {renderInput('address', 'Street Address *', 'Enter your street address', {
              autoCapitalize: 'words'
            })}
            
            <View style={styles.row}>
              <View style={styles.halfWidth}>
                {renderInput('city', 'City', 'City', {
                  autoCapitalize: 'words'
                })}
              </View>
              <View style={styles.halfWidth}>
                {renderInput('zipCode', 'ZIP Code', 'ZIP', {
                  keyboardType: 'numeric'
                })}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Special Instructions</Text>
            {renderInput(
              'deliveryInstructions', 
              'Delivery Instructions (Optional)', 
              'Any special delivery instructions...', 
              {
                multiline: true,
                numberOfLines: 3,
                textAlignVertical: 'top'
              }
            )}
          </View>

          <View style={styles.requiredNote}>
            <Text style={styles.requiredText}>* Required fields</Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E9ECEF',
  },
  closeButton: {
    padding: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  saveButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  saveButtonTextDisabled: {
    opacity: 0.6,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#DDD',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#FFF',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  requiredNote: {
    padding: 16,
    alignItems: 'center',
  },
  requiredText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default DeliveryEditModal;
