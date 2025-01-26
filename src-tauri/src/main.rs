// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![read_file, save_file])
        .invoke_handler(tauri::generate_handler![list_directory, validate_path])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("ファイル読み込みエラー: {}", e))
}

#[tauri::command]
async fn save_file(path: String, contents: String) -> Result<(), String> {
    tokio::fs::write(&path, contents)
        .await
        .map_err(|e| e.to_string())
}

use serde::{Deserialize, Serialize};
use std::{path::{Path, PathBuf}, fs};
use tauri::{command, AppHandle, Runtime};

#[derive(Debug, Serialize, Deserialize)]
struct DirectoryEntry {
    path: String,
    name: String,
    is_directory: bool,
}

#[command]
async fn list_directory<R: Runtime>(
    _app: AppHandle<R>,
    path: Option<String>,
) -> Result<Vec<DirectoryEntry>, String> {
    let base_path = path.as_deref().unwrap_or(""); // ルートパスの扱いを変更
    let path = PathBuf::from(base_path);
    
    if !path.exists() {
        return Err("Path does not exist".into());
    }
    
    if !path.is_dir() {
        return Err("Path is not a directory".into());
    }

    let mut entries = Vec::new();

    if let Ok(read_dir) = fs::read_dir(path) {
        for entry_result in read_dir {
            if let Ok(entry) = entry_result {
                let path = entry.path();
                if let Some(file_name) = path.file_name() {
                    let name = file_name.to_string_lossy().to_string();
                    
                    // 隠しファイルを除外する場合
                    if name.starts_with('.') {
                        continue;
                    }

                    let is_directory = path.is_dir();
                    let full_path = path.to_string_lossy().to_string();

                    entries.push(DirectoryEntry {
                        path: full_path,
                        name,
                        is_directory,
                    });
                }
            }
        }
    }

    // ディレクトリを先に表示
    entries.sort_by(|a, b| {
        b.is_directory.cmp(&a.is_directory)
            .then(a.name.cmp(&b.name))
    });

    Ok(entries)
}

#[command]
async fn validate_path(path: String) -> Result<bool, String> {
    let path = PathBuf::from(&path);
    Ok(path.exists() && path.is_dir())
}