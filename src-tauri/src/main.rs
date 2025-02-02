// Windowsのリリースビルド時に余分なコンソールウィンドウが表示されないようにする設定
// ※この属性はデバッグビルド以外で有効
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

pub fn main() {
    // Tauriアプリケーションのビルダーを初期化し、各種プラグインやコマンドを設定する
    tauri::Builder::default()
        // ダイアログプラグインを初期化（アプリ内でダイアログ表示機能を利用するため）
        .plugin(tauri_plugin_dialog::init())
        // アプリ内で呼び出し可能なコマンドを登録
        .invoke_handler(tauri::generate_handler![
            read_file,
            save_file,
            list_directory,
            validate_path
        ])
        // コンテキストを生成してアプリケーションを実行
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

// ------------------------------
// ファイル読み込み機能
// ------------------------------

// Tauriのコマンドとして非同期に実行される関数。
// 指定されたパスのファイルを読み込み、その内容を文字列として返す。
#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    // tokio::fs::read_to_stringを利用して非同期にファイル内容を取得する
    // エラー発生時はエラーメッセージに日本語で「ファイル読み込みエラー」を付加して返す
    tokio::fs::read_to_string(&path)
        .await
        .map_err(|e| format!("ファイル読み込みエラー: {}", e))
}

// ------------------------------
// ファイル保存機能
// ------------------------------

// Tauriのコマンドとして非同期に実行される関数。
// 指定されたパスに、与えられた内容を書き込む。
#[tauri::command]
async fn save_file(path: String, contents: String) -> Result<(), String> {
    // tokio::fs::writeを利用して非同期にファイルに内容を書き込む
    // エラーが発生した場合、そのエラーメッセージを返す
    tokio::fs::write(&path, contents)
        .await
        .map_err(|e| e.to_string())
}

// ------------------------------
// ディレクトリ内ファイル一覧取得機能
// ------------------------------

use serde::{Deserialize, Serialize};
use std::{
    fs,
    path::{Path, PathBuf},
};
use tauri::{command, AppHandle, Runtime};

// ディレクトリエントリの情報を表現する構造体
// 各エントリに対して、パス、名前、ディレクトリかどうかの情報を保持する
#[derive(Debug, Serialize, Deserialize)]
struct DirectoryEntry {
    // エントリのフルパス
    path: String,
    // エントリ名
    name: String,
    // エントリがディレクトリかどうかのフラグ
    is_directory: bool,
}

// Tauriのコマンドとして非同期に実行される関数。
// 指定されたディレクトリパス内のファイルやサブディレクトリをリストアップする。
#[tauri::command]
async fn list_directory<R: Runtime>(
    _app: AppHandle<R>,  // アプリケーションハンドル（現在の処理内では使用していない）
    path: Option<String>, // リストアップするディレクトリのパス。Noneの場合はルートパスとみなす
) -> Result<Vec<DirectoryEntry>, String> {
    // pathがNoneの場合、空文字列を使い、ルートパスとして扱う
    let base_path = path.as_deref().unwrap_or("");
    let path = PathBuf::from(base_path);

    // 指定されたパスが存在しない場合はエラーを返す
    if !path.exists() {
        return Err("Path does not exist".into());
    }

    // 指定されたパスがディレクトリでない場合もエラーを返す
    if !path.is_dir() {
        return Err("Path is not a directory".into());
    }

    let mut entries = Vec::new();

    // ディレクトリの内容を読み取る
    if let Ok(read_dir) = fs::read_dir(path) {
        for entry_result in read_dir {
            if let Ok(entry) = entry_result {
                let path = entry.path();
                // エントリのファイル名を取得する
                if let Some(file_name) = path.file_name() {
                    let name = file_name.to_string_lossy().to_string();

                    // 隠しファイル（名前が'.'で始まる）は除外する
                    if name.starts_with('.') {
                        continue;
                    }

                    let is_directory = path.is_dir();
                    let full_path = path.to_string_lossy().to_string();

                    // 取得した情報を用いてDirectoryEntry構造体のインスタンスを作成しリストに追加する
                    entries.push(DirectoryEntry {
                        path: full_path,
                        name,
                        is_directory,
                    });
                }
            }
        }
    }

    // ディレクトリがファイルより先に表示されるようにソート
    entries.sort_by(|a, b| {
        b.is_directory
            .cmp(&a.is_directory)  // ディレクトリを優先
            .then(a.name.cmp(&b.name))  // 名前でアルファベット順にソート
    });

    Ok(entries)
}

// ------------------------------
// パスの検証機能
// ------------------------------

// Tauriのコマンドとして非同期に実行される関数。
// 指定されたパスが存在し、かつディレクトリであるかを検証する。
#[command]
async fn validate_path(path: String) -> Result<bool, String> {
    let path = PathBuf::from(&path);
    // パスが存在し、ディレクトリならtrue、そうでなければfalseを返す
    Ok(path.exists() && path.is_dir())
}
