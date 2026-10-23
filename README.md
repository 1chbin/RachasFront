# RachasFront — App móvil (Parte II)

Cliente **React Native** (Expo Router) del monorepo Rachas. Tema Modern Violet e integración con [RachasBack](../RachasBack).

El proyecto usa **Expo SDK 57** para coincidir con **Expo Go 57.x** del App Store / Play Store (p. ej. 57.0.9 en iPhone). Si actualizás Expo Go a SDK 58, subí el proyecto con `expo@^58` y `npx expo install --fix`.

Todos los comandos de esta guía se ejecutan **desde esta carpeta** (`RachasFront/`).

## Requisitos

- Node.js 20+
- Back en ejecución (`npm run start:dev` en `RachasBack/`)
- Android Studio / emulador o Expo Go en dispositivo físico

## Configuración

1. `cp .env.example .env` (o copiá el archivo en Windows).
2. Completá las variables **Firebase** de `.env.example` (app Web en consola; p. ej. `rachas-50813`).
3. Ajustá `EXPO_PUBLIC_API_URL`:
   - **Emulador Android:** `http://10.0.2.2:3000`
   - **iPhone / Android físico (Expo Go, misma Wi‑Fi):** `http://<IP-de-tu-PC>:3000` (la misma IP que en `exp://192.168.x.x:8081` de la terminal; sin el `:8081`). Revisá que no haya un dígito de más en la IP.
   - **Navegador web (`w`):** no hace falta cambiar el `.env` solo por web: si la URL es `10.0.2.2` o una IP `192.168.x.x`, la app en web llama al back en **`http://localhost:3000`** automáticamente. El back debe estar corriendo en tu PC (`npm run start:dev` en `RachasBack/`).
   - Override opcional: `EXPO_PUBLIC_API_URL_WEB` si el back en web no es localhost.
   - Reiniciá con `npx expo start -c` tras cambiar `.env`.

## Ejecución

```bash
npm install
npx expo start
```

- **`a`** — emulador Android (recomendado para el TP).
- **QR** — Expo Go **SDK 57** en el celular (misma red Wi‑Fi; versión del proyecto = versión de Expo Go).
- **`w`** — vista web en el navegador (opcional; el token se guarda en `sessionStorage`, no en Secure Store).

**Web vs Expo Go:** en **celular o emulador** el ingreso principal es **email y contraseña** (Firebase). En **web** (`w`) podés usar email/contraseña y además **Continuar con Google** (`signInWithPopup`; no hace falta configurar redirect en Google Cloud). El ID token en web persiste en `sessionStorage` hasta cerrar la pestaña; en nativo va a Secure Store.

Después de cambiar `babel.config.js`, reiniciá con caché limpia: `npx expo start -c`.

### No veo nada en el navegador (pantalla negra)

1. Preferí **emulador Android** o **Expo Go**; no hace falta usar Chrome en `localhost:8081`.
2. Abrí **F12 → Consola** y buscá errores en rojo.
3. Ejecutá `npx expo start -c` y volvé a abrir con **`w`** desde la terminal de Expo.

Probado en desarrollo con **emulador Android** (Windows).

## Estructura

- `app/` — rutas (ingreso, tabs, detalle de desafío)
- `services/api/` — cliente HTTP con `Authorization: Bearer` (Firebase ID token)
- `services/auth/` — Firebase Auth (email/contraseña; Google en web vía popup)
- `theme/` — paleta Modern Violet (modo claro)
- `assets/images/logo.png` — logo de marca

## Pantallas

Ingreso con **email/contraseña** (y **Google** en web si ya te registraste con ese email), elegir alias (primer acceso), Inicio, Explorar, Crear, Perfil y Detalle del desafío.

### Autenticación (Parte III)

**Solo Firebase Console** (no hace falta abrir Google Cloud para email/contraseña):

1. **Authentication → Sign-in method:** correo/contraseña y Google habilitados.
2. **Authentication → Settings → Authorized domains:** incluir `localhost` (web con `w`).
3. Recomendado: **una cuenta por dirección de email** (mismo usuario si después usás Google con el mismo mail).
4. En `.env`: `EXPO_PUBLIC_FIREBASE_*` (ver `.env.example`).

**Flujo en la app**

1. **Registrate** o **ingresá** con email y contraseña.
2. Si es tu primera vez, elegís un **alias** único antes de entrar.
3. **Google (solo web):** botón **Continuar con Google** — el back solo acepta Google si ya existe una persona en Mongo con **el mismo email** (registro previo con contraseña). Si no, verás un mensaje para registrarte primero con email.
4. En **Expo Go / emulador** usá email y contraseña; el hint en ingreso indica que Google está en la versión web.

**Firebase vs Auth0 (TP):** Firebase con SDK JS en Expo, tier gratuito para el TP y Admin SDK en NestJS; Google cumple el requisito social del TP en web.

## Verificación manual (Parte II)

1. Levantá el back y la app con dos usuarios distintos (dos sesiones o dos dispositivos).
2. Usuario A crea un desafío; usuario B se une con el código.
3. Con el desafío `ACTIVO`, registrá check-ins y refrescá el ranking en Detalle.
4. Apagá el back: cada pantalla debe mostrar error comprensible y botón **Reintentar**.
