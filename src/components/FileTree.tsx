// FileTree.tsx
import { invoke } from "@tauri-apps/api/core";
import { FileIcon, FolderIcon } from "@yamada-ui/lucide";
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
const FileNodeItem: React.FC<{ node: FileNode }> = ({ node }) => {
    // 初期状態：node.children が undefined なら null とする
    const [children, setChildren] = useState<FileNode[] | null>(
        node.children ?? null
    );
    const [loading, setLoading] = useState(false);

    // フォルダがクリックされたとき、未取得の場合は子要素を取得する
    const handleExpand = async () => {
        if (node.is_directory && children === null) {
            setLoading(true);
            try {
                const fetchedChildren = await fetchChildren(node.path);
                setChildren(fetchedChildren);
            } catch (error) {
                console.error("子要素の取得に失敗しました", error);
            }
            setLoading(false);
        }
    };

    if (node.is_directory) {
        return (
            <AccordionItem key={node.path} borderY="none">
                <AccordionLabel py="0" onClick={handleExpand}>
                    <FolderIcon mr="8px" color={"orange"} />
                    {node.name}
                </AccordionLabel>
                <AccordionPanel
                    px="0"
                    ml="16px"
                    py="0"
                    borderLeft="1px solid #2c2c2c"
                >
                    {loading && <Loading></Loading>}
                    {!loading && children &&
                        children.map((child) => (
                            <FileNodeItem key={child.path} node={child} />
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

interface FileStructureAccordionProps {
    structure: FileNode[];
}

// ルートレベルのファイル/フォルダリストを再帰的にレンダリングするコンポーネント
const FileStructureAccordion: React.FC<FileStructureAccordionProps> = ({
    structure,
}) => {
    return (
        <Accordion multiple iconHidden borderLeft="1px gray.900 solid">
            {structure.map((node) => (
                <FileNodeItem key={node.path} node={node} />
            ))}
        </Accordion>
    );
};

// FileTree コンポーネント（App から fileStructure を受け取る）
export default function FileTree({
    fileStructure,
}: {
    fileStructure: FileNode[];
}) {
    return <FileStructureAccordion structure={fileStructure} />;
}
