# Task Manager - Ionic & Firebase 🚀

Esta es una aplicación híbrida de gestión de tareas desarrollada con **Ionic Framework**, **Angular** y **Firebase**. El proyecto cumple con los requerimientos de la prueba técnica, incluyendo persistencia en tiempo real y configuración remota.

## 🛠️ Características y Funcionalidades
- **CRUD Completo**: Creación, lectura, actualización y eliminación de tareas y categorías.
- **Firebase Firestore**: Sincronización de datos en tiempo real.
- **Feature Flag (Remote Config)**: Control dinámico de la interfaz (botón de eliminar) desde la consola de Firebase.
- **Optimización**: Implementación de Lazy Loading y Programación Reactiva (Observables).
- **Interfaz Nativa**: Diseño adaptativo con componentes de Ionic.

## 🚀 Instalación y Ejecución

### Requisitos previos
- Node.js & npm
- Ionic CLI (`npm install -g @ionic/cli`)

### Pasos para ejecutar localmente
1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/yeisongn2022/task-manager-ionic-firebase.git](https://github.com/yeisongn2022/task-manager-ionic-firebase.git)

2. Instalar dependencias:
    ```Bash
    npm install

3. Ejecutar en el navegador:
    ```Bash
    ionic serve

📱 Compilación Móvil (Android)
Este proyecto utiliza Capacitor para la estructura híbrida:
1. Generar el build de producción:
    ```Bash
    ionic build

2. Sincronizar con el proyecto de Android:
    ```Bash
    npx cap sync android

3. Abrir en Android Studio para generar el APK:
    ```Bash
    npx cap open android

⚙️ Configuración de Remote Config
Se implementó un Feature Flag llamado show_delete_option (Boolean).
- true: Muestra el botón de eliminar en las tareas.
- false: Oculta el botón de eliminar globalmente.

Desarrollado por: Yeison GN