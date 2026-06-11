import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Linking,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Animated,
  useWindowDimensions,
} from 'react-native';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { useNavigation } from '@react-navigation/native';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { colors, radius, typography } from '../../theme';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const navigation = useNavigation<any>();
  const { height } = useWindowDimensions();

  const [email, setEmail]             = useState('');
  const [password, setPassword]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading]         = useState(false);

  const fadeAnim  = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completá todos los campos');
      return;
    }
    setLoading(true);
    try {
      const response = await authService.login(email, password);
      await signIn(response.user, response.token);
      // AppNavigator switches to PrivateNavigator automatically on auth state change
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const HEADER_HEIGHT = height * 0.40;

  return (
    <View style={styles.root}>
      <View
        style={{ position: 'absolute', top: 0, left: 0, right: 0, height: HEADER_HEIGHT + 40, backgroundColor: colors.red }}
      />

      {/* Header: logo + nombre del club */}
      <View style={[styles.header, { height: HEADER_HEIGHT }]}>
        {navigation.canGoBack() && (
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
          >
            <MaterialCommunityIcons name="arrow-left" size={24} color={colors.text} />
          </TouchableOpacity>
        )}
        <View style={styles.logoWrapper}>
          <Image
            source={require('../../../assets/images/logo_river_transparente.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.clubName}>CLUB RIVER PLATE</Text>
        <Text style={styles.clubSub}>Santo Tomé · Corrientes</Text>
      </View>

      {/* Body con curva blanca */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          <Animated.View
            style={[
              styles.formContainer,
              { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
            ]}
          >
            <Text style={styles.formTitle}>INICIÁ SESIÓN</Text>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="email-outline"
                size={20}
                color={colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                editable={!loading}
                style={styles.input}
              />
            </View>

            {/* Contraseña */}
            <View style={styles.inputWrapper}>
              <MaterialCommunityIcons
                name="lock-outline"
                size={20}
                color={colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Contraseña"
                placeholderTextColor={colors.muted}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                editable={!loading}
                style={styles.input}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(p => !p)}
                style={styles.eyeBtn}
              >
                <MaterialCommunityIcons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={20}
                  color={colors.muted}
                />
              </TouchableOpacity>
            </View>

            {/* Botón ingresar */}
            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={[styles.loginBtnOuter, loading && styles.loginBtnDisabled]}
            >
              <View style={styles.loginBtn}>
                {loading
                  ? <ActivityIndicator color={colors.text} size="small" />
                  : <Text style={styles.loginBtnLabel}>Ingresar al club</Text>
                }
              </View>
            </TouchableOpacity>

            {/* Olvidé contraseña */}
            <TouchableOpacity
              style={styles.forgotBtn}
              onPress={() =>
                Alert.alert(
                  'Recuperar contraseña',
                  'Envianos un mensaje por WhatsApp y te ayudamos a recuperar tu acceso.',
                  [
                    { text: 'Cancelar', style: 'cancel' },
                    {
                      text: 'Ir a WhatsApp',
                      onPress: () =>
                        Linking.openURL(
                          'https://wa.me/5493756415586?text=Hola,%20olvidé%20mi%20contraseña%20de%20la%20app'
                        ),
                    },
                  ]
                )
              }
            >
              <Text style={styles.forgotText}>¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>

            {/* Separador */}
            <View style={styles.separatorRow}>
              <View style={styles.separatorLine} />
              <Text style={styles.separatorText}>o</Text>
              <View style={styles.separatorLine} />
            </View>

            {/* Inscribirse */}
            <TouchableOpacity
              style={styles.registerBtn}
              onPress={() => navigation.navigate('InscripcionPublica')}
            >
              <Text style={styles.registerText}>Inscribirse al club →</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg,
  },

  /* ── Header ── */
  backBtn: {
    position:        'absolute',
    top:             52,
    left:            20,
    zIndex:          10,
    backgroundColor: colors.glassBorder,
    borderRadius:    20,
    padding:         8,
  },
  header: {
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 52,
  },
  logoWrapper: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.glass,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 2,
    borderColor: colors.glassBorder,
  },
  logo: {
    width: 58,
    height: 58,
  },
  clubName: {
    ...typography.display,
    fontSize: 26,
    color: colors.text,
    marginBottom: 4,
  },
  clubSub: {
    ...typography.body,
    fontSize: 13,
    color: colors.text,
  },

  /* ── Formulario ── */
  formContainer: {
    backgroundColor: colors.bg,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    paddingTop: 36,
    paddingHorizontal: 24,
    paddingBottom: 48,
    gap: 14,
    minHeight: 420,
  },
  formTitle: {
    ...typography.display,
    fontSize: 30,
    color: colors.text,
    marginBottom: 6,
  },

  /* ── Inputs ── */
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.sm + 2,
    paddingHorizontal: 14,
    height: 54,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: 15,
    color: colors.text,
    ...typography.body,
  },
  eyeBtn: { padding: 4 },

  /* ── Botón principal ── */
  loginBtnOuter: {
    borderRadius: radius.sm + 2,
    overflow: 'hidden',
    shadowColor: colors.red,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
    marginTop: 4,
  },
  loginBtnDisabled: { opacity: 0.6 },
  loginBtn: {
    height:          54,
    alignItems:      'center',
    justifyContent:  'center',
    backgroundColor: colors.red,
  },
  loginBtnLabel: {
    ...typography.bodyBold,
    color: colors.text,
    fontSize: 16,
  },

  /* ── Links ── */
  forgotBtn: { alignItems: 'center', paddingVertical: 2 },
  forgotText: {
    ...typography.bodyMedium,
    fontSize: 14,
    color: colors.red,
  },

  /* ── Separador ── */
  separatorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 2,
  },
  separatorLine: { flex: 1, height: 1, backgroundColor: colors.border },
  separatorText: {
    ...typography.body,
    fontSize: 13,
    color: colors.muted,
  },

  /* ── Inscribirse ── */
  registerBtn: { alignItems: 'center', paddingVertical: 4 },
  registerText: {
    ...typography.bodySemiBold,
    fontSize: 15,
    color: colors.redBright,
  },
});
