import { registerUser } from '@/services/AuthService';
import { Link } from 'expo-router';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ActivityIndicator, Alert, KeyboardAvoidingView, Platform, ScrollView,
  StyleSheet,
  Text, TextInput, TouchableOpacity,
  View
} from 'react-native';
export default function SignupScreen() {
  const { t } = useTranslation();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // 1. New State for Gender
  const [gender, setGender] = useState<'male' | 'female' | ''>(''); 
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {

    
    if (!name || !email || !password || !gender) {
      Alert.alert('Error', 'Please fill in all fields including gender');
      return;
    }

    setLoading(true);
    try {
      
      await registerUser(email, password, name, gender);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>{t('Create Account')}</Text>
          <Text style={styles.subtitle}>{t('Start your dating journey today')}</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('Full Name')}</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('Email')}</Text>
            <TextInput
              style={styles.input}
              placeholder="hello@example.com"
              placeholderTextColor="#999"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('Password')}</Text>
            <TextInput
              style={styles.input}
              placeholder="Create a password"
              placeholderTextColor="#999"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

         
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t('I am a')}</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity 
                style={[
                  styles.genderButton, 
                  gender === 'male' && styles.genderButtonSelected
                ]}
                onPress={() => setGender('male')}
              >
                <Text style={[
                  styles.genderText, 
                  gender === 'male' && styles.genderTextSelected
                ]}>{t('Male')}</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.genderButton, 
                  gender === 'female' && styles.genderButtonSelected
                ]}
                onPress={() => setGender('female')}
              >
                <Text style={[
                  styles.genderText, 
                  gender === 'female' && styles.genderTextSelected
                ]}>{t('Female')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.button} 
            onPress={handleSignup}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>{t('Create Account')}</Text>
            )}
          </TouchableOpacity>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('Already have an account?')} </Text>
            <Link href="/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>{t('Sign In')}</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    marginTop: 40,
    flexGrow: 1,
    justifyContent: 'center',
    padding: 24,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  form: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  // 5. Styles for Gender Buttons
  genderRow: {
    flexDirection: 'row',
    gap: 15,
  },
  genderButton: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  genderButtonSelected: {
    backgroundColor: '#fe3c72',
    borderColor: '#fe3c72',
  },
  genderText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  genderTextSelected: {
    color: '#fff',
    fontWeight: 'bold',
  },
  button: {
    height: 56,
    backgroundColor: '#fe3c72',
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#fe3c72',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
    marginBottom: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 16,
  },
  link: {
    color: '#fe3c72',
    fontSize: 16,
    fontWeight: 'bold',
  },
});