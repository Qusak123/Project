import { supabase } from '../lib/supabase';

const sampleTransactions = [
  {
    transaction_id: 'TXN001',
    amount: 45.99,
    location: 'New York, USA',
    merchant: 'Amazon Store',
    merchant_category: 'retail',
    device_info: 'iPhone 13',
    ip_address: '192.168.1.100',
    fraud_score: 0.15,
    is_fraudulent: false,
    detection_reason: 'Normal transaction pattern'
  },
  {
    transaction_id: 'TXN002',
    amount: 8750.00,
    location: 'London, UK',
    merchant: 'Luxury Casino Online',
    merchant_category: 'gambling',
    device_info: 'Unknown Device',
    ip_address: '45.123.67.89',
    fraud_score: 0.85,
    is_fraudulent: true,
    detection_reason: 'Unusual transaction amount, High-risk merchant category, Abnormal transaction timing'
  },
  {
    transaction_id: 'TXN003',
    amount: 129.50,
    location: 'Los Angeles, USA',
    merchant: 'Best Buy Electronics',
    merchant_category: 'electronics',
    device_info: 'Samsung Galaxy S21',
    ip_address: '192.168.1.105',
    fraud_score: 0.22,
    is_fraudulent: false,
    detection_reason: 'Normal transaction pattern'
  },
  {
    transaction_id: 'TXN004',
    amount: 12500.00,
    location: 'Tokyo, Japan',
    merchant: 'Crypto Exchange Pro',
    merchant_category: 'crypto',
    device_info: 'Linux Desktop',
    ip_address: '103.45.78.23',
    fraud_score: 0.92,
    is_fraudulent: true,
    detection_reason: 'Very high transaction value, High-risk merchant category, Location and IP mismatches'
  },
  {
    transaction_id: 'TXN005',
    amount: 67.89,
    location: 'Chicago, USA',
    merchant: 'Starbucks Coffee',
    merchant_category: 'food',
    device_info: 'iPhone 12',
    ip_address: '192.168.1.102',
    fraud_score: 0.10,
    is_fraudulent: false,
    detection_reason: 'Normal transaction pattern'
  },
  {
    transaction_id: 'TXN006',
    amount: 6200.00,
    location: 'Moscow, Russia',
    merchant: 'Premium Luxury Goods',
    merchant_category: 'luxury',
    device_info: 'Unknown Device',
    ip_address: '87.234.56.12',
    fraud_score: 0.78,
    is_fraudulent: true,
    detection_reason: 'Unusual transaction amount, High-risk merchant category, Transaction frequency patterns'
  },
  {
    transaction_id: 'TXN007',
    amount: 234.50,
    location: 'San Francisco, USA',
    merchant: 'Target Store',
    merchant_category: 'retail',
    device_info: 'iPad Pro',
    ip_address: '192.168.1.108',
    fraud_score: 0.18,
    is_fraudulent: false,
    detection_reason: 'Normal transaction pattern'
  },
  {
    transaction_id: 'TXN008',
    amount: 9999.99,
    location: 'Dubai, UAE',
    merchant: 'Gold Trading International',
    merchant_category: 'luxury',
    device_info: 'Android Unknown',
    ip_address: '154.67.89.34',
    fraud_score: 0.88,
    is_fraudulent: true,
    detection_reason: 'Very high transaction value, High-risk merchant category, Abnormal transaction timing, Location and IP mismatches'
  },
  {
    transaction_id: 'TXN009',
    amount: 89.99,
    location: 'Boston, USA',
    merchant: 'Netflix Subscription',
    merchant_category: 'entertainment',
    device_info: 'MacBook Pro',
    ip_address: '192.168.1.110',
    fraud_score: 0.12,
    is_fraudulent: false,
    detection_reason: 'Normal transaction pattern'
  },
  {
    transaction_id: 'TXN010',
    amount: 15000.00,
    location: 'Lagos, Nigeria',
    merchant: 'Unknown Merchant XYZ',
    merchant_category: 'unknown',
    device_info: 'Unknown Device',
    ip_address: '197.45.23.67',
    fraud_score: 0.95,
    is_fraudulent: true,
    detection_reason: 'Very high transaction value, High-risk merchant category, Location and IP mismatches, Device and behaviour anomalies'
  }
];

export async function addSampleTransactions() {
  try {
    const { data, error } = await supabase
      .from('transactions')
      .insert(sampleTransactions)
      .select();

    if (error) {
      console.error('Error adding sample transactions:', error);
      return { success: false, error };
    }

    console.log('Successfully added sample transactions:', data);
    return { success: true, data };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { success: false, error: err };
  }
}