import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

const DeliveryCard = ({ deliveryInfo, onEdit, hasDeliveryInfo }) => {
  if (!hasDeliveryInfo) {
    return (
      <TouchableOpacity style={styles.emptyCard} onPress={onEdit} activeOpacity={0.7}>
        <View style={styles.emptyCardContent}>
          <MaterialIcons name="add-location" size={32} color="#FF6B6B" />
          <Text style={styles.emptyCardTitle}>Add Delivery Information</Text>
          <Text style={styles.emptyCardSubtext}>
            We need your details to deliver your order
          </Text>
        </View>
        <MaterialIcons name="chevron-right" size={24} color="#999" />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onEdit} activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.headerLeft}>
          <MaterialIcons name="location-on" size={24} color="#FF6B6B" />
          <Text style={styles.cardTitle}>Delivery Information</Text>
        </View>
        <MaterialIcons name="edit" size={20} color="#666" />
      </View>
      
      <View style={styles.cardContent}>
        <View style={styles.infoRow}>
          <MaterialIcons name="person" size={16} color="#666" />
          <Text style={styles.infoText}>{deliveryInfo.getDisplayName()}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="phone" size={16} color="#666" />
          <Text style={styles.infoText}>
            {deliveryInfo.phoneNumber || 'No phone number'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="email" size={16} color="#666" />
          <Text style={styles.infoText}>
            {deliveryInfo.email || 'No email'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <MaterialIcons name="location-on" size={16} color="#666" />
          <Text style={styles.infoText}>
            {deliveryInfo.getFormattedAddress() || 'No address'}
          </Text>
        </View>
        
        {deliveryInfo.deliveryInstructions ? (
          <View style={styles.instructionsRow}>
            <MaterialIcons name="note" size={16} color="#666" />
            <Text style={styles.instructionsText}>
              {deliveryInfo.deliveryInstructions}
            </Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 2,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emptyCardContent: {
    flex: 1,
    alignItems: 'center',
  },
  emptyCardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 8,
    marginBottom: 4,
  },
  emptyCardSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8,
  },
  cardContent: {
    gap: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 12,
    flex: 1,
  },
  instructionsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 4,
    marginTop: 4,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  instructionsText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 12,
    flex: 1,
    fontStyle: 'italic',
  },
});

export default DeliveryCard;
