import { FileIcon, FolderIcon } from "@yamada-ui/lucide";
import {
    Accordion,
    AccordionItem,
    AccordionLabel,
    AccordionPanel,
    Text
} from "@yamada-ui/react";
import React from "react";

// ファイルまたはフォルダの型定義
interface FileNode {
    name: string;
    children?: FileNode[]; // 子要素がある場合は再帰的に FileNode 型の配列
}

const fileStructure: FileNode[] = [
    {
        name: "フォルダ1",
        children: [
            {
                name: "ファイル1-1",
                children: [{ name: "ファイル1-1-1" }],
            },
            { name: "ファイル1-2" },
            { name: "ファイル1-3" },
        ],
    },
    {
        name: "フォルダ2",
        children: [
            { name: "ファイル2-1" },
            { name: "ファイル2-2" },
            { name: "ファイル2-3" },
        ],
    },
    {
        name: "フォルダ3",
        children: [
            { name: "ファイル3-1" },
            { name: "ファイル3-2" },
            { name: "ファイル3-3" },
        ],
    },
];

interface FileStructureAccordionProps {
    structure: FileNode[];
}

const FileStructureAccordion: React.FC<FileStructureAccordionProps> = ({
    structure,
}) => {
    /**
     * nodes に対して再帰的に要素を生成する
     * @param nodes ファイル/フォルダのリスト
     */
    const renderFileNodes = (nodes: FileNode[]) => {
        return nodes.map((node) => {
            if (node.children) {
                // 子要素がある場合は AccordionItem としてレンダリング
                return (
                    <AccordionItem key={node.name} borderY={"none"}>
                        <AccordionLabel py="0">
                            <FolderIcon mr={"8px"} />
                            {node.name}
                        </AccordionLabel>
                        <AccordionPanel px="0" ml={"16px"} py="0" borderLeft={"1px solid #2c2c2c"}>
                            {renderFileNodes(node.children)}
                        </AccordionPanel>
                    </AccordionItem>
                );
            } else {
                // 子要素がなければ単なるラベルとして表示
                return (
                    <Text key={node.name} align={"left"} ml={"16px"}>
                        <FileIcon></FileIcon>
                        {node.name}
                    </Text>
                );
            }
        });
    };

    // ここで1個の Accordion を返す
    return <Accordion multiple iconHidden={true} borderLeft={"1px gray.900 solid"}>{renderFileNodes(structure)}</Accordion>;
};

export default function App() {
    return <FileStructureAccordion structure={fileStructure} />;
}
