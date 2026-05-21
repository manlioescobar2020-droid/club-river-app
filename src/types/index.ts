export type UserRol =
  | "WEBMASTER"
  | "ADMIN"
  | "PROFESOR"
  | "SOCIO"
  | "PARTICIPANTE"
  | "TUTOR_RESPONSABLE"

export type Usuario = {
  id: string
  nombre: string
  apellido: string
  email: string
  rol: UserRol
}

export type AuthSession = {
  token: string
  usuario: Usuario
}

// Navegación
export type AuthStackParamList = {
  Login: undefined
}

export type AppTabParamList = {
  Inicio: undefined
  Cuotas: undefined
  Perfil: undefined
}
