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
2. Ajustá `EXPO_PUBLIC_API_URL`:
   - **Navegador web (`w`):** `http://localhost:3000` (si el `.env` tiene `10.0.2.2`, el cliente en web igual apunta a `localhost`)
   - **Emulador Android:** `http://10.0.2.2:3000`
   - **iPhone / Android físico (Expo Go, misma Wi‑Fi):** `http://<IP-de-tu-PC>:3000` (la misma IP que en `exp://192.168.x.x:8081` de la terminal). Reiniciá con `npx expo start -c` tras cambiar `.env`.

## Ejecución

```bash
npm install
npx expo start
```

- **`a`** — emulador Android (recomendado para el TP).
- **QR** — Expo Go **SDK 57** en el celular (misma red Wi‑Fi; versión del proyecto = versión de Expo Go).
- **`w`** — vista web en el navegador (opcional).

Después de cambiar `babel.config.js`, reiniciá con caché limpia: `npx expo start -c`.

### No veo nada en el navegador (pantalla negra)

1. Preferí **emulador Android** o **Expo Go**; no hace falta usar Chrome en `localhost:8081`.
2. Abrí **F12 → Consola** y buscá errores en rojo.
3. Ejecutá `npx expo start -c` y volvé a abrir con **`w`** desde la terminal de Expo.

Probado en desarrollo con **emulador Android** (Windows).

## Estructura

- `app/` — rutas (ingreso, tabs, detalle de desafío)
- `services/api/` — cliente HTTP tipado (`x-usuario-id`)
- `theme/` — paleta Modern Violet (modo claro)
- `assets/images/logo.png` — logo de marca

## Pantallas

Ingreso, Inicio, Explorar, Crear, Perfil y Detalle del desafío (ranking, check-in, código).

## Verificación manual (Parte II)

1. Levantá el back y la app con dos usuarios distintos (dos sesiones o dos dispositivos).
2. Usuario A crea un desafío; usuario B se une con el código.
3. Con el desafío `ACTIVO`, registrá check-ins y refrescá el ranking en Detalle.
4. Apagá el back: cada pantalla debe mostrar error comprensible y botón **Reintentar**.
