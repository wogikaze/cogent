// FileTree.tsx
import { invoke } from "@tauri-apps/api/core";
import { FileIcon, FolderIcon, FolderMinusIcon } from "@yamada-ui/lucide";
import { Accordion, AccordionItem, AccordionLabel, AccordionPanel, Loading, Text } from "@yamada-ui/react";
import React, { useState } from "react";

// ファイルまたはフォルダの型定義
export interface FileNode {
    name: string;
    path: string;
    is_directory: boolean;
    children?: FileNode[];
}

// FileTree コンポーネントの props 定義
interface FileTreeProps {
    fileStructure: FileNode[];
    onFileDoubleClick: (path: string) => void;
}

const fetchChildren = async (path: string): Promise<FileNode[]> => {
    return await invoke<FileNode[]>("list_directory", { path });
};

interface FileNodeItemComponentProps {
    node: FileNode;
    onFileDoubleClick: (path: string) => void;
}
// 各ファイル/フォルダの表示を担当するコンポーネント
const FileNodeItemComponent: React.FC<FileNodeItemComponentProps> = ({ node, onFileDoubleClick }) => {
    // 初期状態：node.children が undefined なら null とする
    const [children, setChildren] = useState<FileNode[] | null>(node.children ?? null);
    const [loading, setLoading] = useState(false);
    // 展開状態を管理。true: 開いている、false: 閉じている
    const [expanded, setExpanded] = useState(false);

    // フォルダを開く場合、子要素がないなら取得し、あるなら必ず孫要素を更新取得する
    const handleExpand = async () => {
        setLoading(true);
        try {
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

    const handleToggle = async () => {
        if (!expanded) {
            await handleExpand();
        } else {
            setChildren(null);
        }
        setExpanded(!expanded);
    };

    if (node.is_directory) {
        return (
            <AccordionItem key={node.path} borderY="none">
                <AccordionLabel py="0" onClick={handleToggle}>
                    {children ? <FolderIcon mr="8px" color="orange" /> : <FolderMinusIcon mr="8px" color="orange" />}
                    {node.name}
                    {loading && <Loading fontSize="sm" mr="4px" />}
                </AccordionLabel>
                <AccordionPanel px="0" ml="16px" py="0" borderLeft="1px solid #2c2c2c">
                    {children &&
                        children.map((child) => (
                            <FileNodeItemComponent key={child.path} node={child} onFileDoubleClick={onFileDoubleClick} />
                        ))}
                </AccordionPanel>
            </AccordionItem>
        );
    } else {
        return (
            <Text
                key={node.path}
                align="left"
                ml="16px"
                // ファイルの場合は、ダブルクリックで onFileDoubleClick を呼び出す
                onDoubleClick={() => onFileDoubleClick(node.path)}
                cursor="pointer"
                _hover={{ textDecoration: "underline" }}
            >
                <FileIcon mr="4px" />
                {node.name}
            </Text>
        );
    }
};

export default function FileTree({ fileStructure, onFileDoubleClick }: FileTreeProps) {
    return (
        <Accordion multiple iconHidden borderLeft="1px gray.900 solid">
            {fileStructure.map((node) => (
                <FileNodeItemComponent key={node.path} node={node} onFileDoubleClick={onFileDoubleClick} />
            ))}
        </Accordion>
    );
}
