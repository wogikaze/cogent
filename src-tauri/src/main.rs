// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![read_file, save_file])
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
  tokio::fs::read_to_string(&path)
    .await
    .map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_file(path: String, contents: String) -> Result<(), String> {
  tokio::fs::write(&path, contents)
    .await
    .map_err(|e| e.to_string())
}