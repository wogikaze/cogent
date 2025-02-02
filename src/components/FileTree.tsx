// FileTree.tsx
import { invoke } from "@tauri-apps/api/core";
import { FileIcon, FolderIcon, FolderMinusIcon } from "@yamada-ui/lucide";
import {
    Accordion,
    AccordionItem,
    AccordionLabel,
    AccordionPanel,
    Loading,
    Text,
} from "@yamada-ui/react";
import React, { useState } from "react";

// ファイルまたはフォルダの型定義
export interface FileNode {
    name: string;
    path: string; // ファイルのフルパス
    is_directory: boolean;
    // 初期状態では children は undefined とし、必要になったときに取得する
    children?: FileNode[];
}

// 指定されたパスの子要素を取得する非同期関数
const fetchChildren = async (path: string): Promise<FileNode[]> => {
    return await invoke<FileNode[]>("list_directory", { path });
};

// 各ファイル/フォルダの表示を担当するコンポーネント
const FileNodeItemComponent: React.FC<{ node: FileNode }> = ({ node }) => {
    // 初期状態：node.children が undefined なら null とする
    const [children, setChildren] = useState<FileNode[] | null>(node.children ?? null);
    const [loading, setLoading] = useState(false);
    // 展開状態を管理。true: 開いている、false: 閉じている
    const [expanded, setExpanded] = useState(false);

    // フォルダを開く場合、子要素がないなら取得し、あるなら必ず孫要素を更新取得する
    const handleExpand = async () => {
        setLoading(true);
        try {
            // まず、子要素が存在しなければ直下の子要素を取得する
            let currentChildren = children;
            if (currentChildren === null) {
                currentChildren = await fetchChildren(node.path);
            }
            setChildren(currentChildren);
        } catch (error) {
            console.error("子要素の取得に失敗しました", error);
        }
        setLoading(false);
    };

    // トグル用のハンドラ。展開中なら閉じる際にキャッシュ削除する
    const handleToggle = async () => {
        if (!expanded) {
            // 開く場合は、子要素・孫要素を取得
            await handleExpand();
        } else {
            // 閉じる場合はキャッシュをクリア（メモリ解放）
            setChildren(null)
        }
        setExpanded(!expanded);
    };

    if (node.is_directory) {
        return (
            <AccordionItem key={node.path} borderY="none">
                {/* AccordionLabel の onClick を handleToggle に変更 */}
                <AccordionLabel py="0" onClick={handleToggle}>
                    {children ? <FolderIcon mr="8px" color={"orange"} />
                        : <FolderMinusIcon mr="8px" color={"orange"} />}
                    {node.name}
                    {loading && <Loading fontSize="sm" mr="4px" />}
                </AccordionLabel>
                <AccordionPanel
                    px="0"
                    ml="16px"
                    py="0"
                    borderLeft="1px solid #2c2c2c"
                >
                    {children &&
                        children.map((child) => (
                            <FileNodeItemComponent key={child.path} node={child} />
                        ))}
                </AccordionPanel>
            </AccordionItem>
        );
    } else {
        return (
            <Text key={node.path} align="left" ml="16px">
                <FileIcon mr="4px" />
                {node.name}
            </Text>
        );
    }
};

// FileTree コンポーネント（App から fileStructure を受け取る）
export default function FileTree({
    fileStructure,
}: {
    fileStructure: FileNode[];
}) {
    return (
        <Accordion multiple iconHidden borderLeft="1px gray.900 solid">
            {fileStructure.map((node) => (
                <FileNodeItemComponent key={node.path} node={node} />
            ))}
        </Accordion>
    );
}
