// FileTree.tsx
import { SimpleTreeView, TreeItem } from '@mui/x-tree-view';
import { invoke } from '@tauri-apps/api/core';
import { memo, useCallback, useEffect, useState } from 'react';

interface DirectoryNode {
    path: string;
    name: string;
    is_directory: boolean;
    loaded: boolean;
    children: DirectoryNode[];
}

interface FileTreeProps {
    currentDir: string | null;
}
const DirectoryNodeComponent = memo(({
    node,
    expandedNodes,
    onToggle
}: {
    node: DirectoryNode;
    expandedNodes: string[];
    onToggle: (path: string) => void;
}) => {
    const isExpanded = expandedNodes.includes(node.path);
    const [localChildren, setLocalChildren] = useState(node.children);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        setLocalChildren(node.children);
    }, [node.children]);

    const handleToggle = async () => {
        if (!node.loaded && node.is_directory) {
            setIsLoading(true);
            try {
                const children = await invoke('list_directory', { path: node.path }) as DirectoryNode[];;
                node.children = children.map((child: DirectoryNode) => ({
                    ...child,
                    loaded: false,
                    children: []
                }));
                node.loaded = true;
                setLocalChildren(node.children);
            } catch (error) {
                console.error('Error loading directory:', error);
            } finally {
                setIsLoading(false);
            }
        }
        onToggle(node.path);
    };

    return (
        <TreeItem
            itemId={node.path}
            label={
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {node.is_directory ? (
                        <span style={{ cursor: 'pointer' }} onClick={handleToggle}>
                            {isExpanded ? '▼' : '▶'}
                        </span>
                    ) : null}
                    {node.is_directory ? '📁' : '📄'}
                    <span>{node.name}</span>
                    {isLoading && '...'}
                </div>
            }
        >
            {isExpanded && localChildren.map(child => (
                <DirectoryNodeComponent
                    key={child.path}
                    node={child}
                    expandedNodes={expandedNodes}
                    onToggle={onToggle}
                />
            ))}
        </TreeItem>
    );
});

export default function FileTree({ currentDir }: FileTreeProps) {
    const [treeData, setTreeData] = useState<DirectoryNode[]>([]);
    const [expandedNodes, setExpandedNodes] = useState<string[]>([]);

    const handleNodeToggle = useCallback((path: string) => {
        setExpandedNodes(prev =>
            prev.includes(path)
                ? prev.filter(p => p !== path)
                : [...prev, path]
        );
    }, []);
    const loadChildren = useCallback(async (path: string) => {
        try {
            const children: DirectoryNode[] = await invoke('list_directory', { path });
            return children.map(child => ({
                ...child,
                loaded: false,
                children: []
            }));
        } catch (error) {
            console.error('Error loading directory:', error);
            return [];
        }
    }, []);

    useEffect(() => {
        const loadInitialData = async () => {
            if (currentDir) {
                try {
                    const rootNodes = await loadChildren(currentDir);
                    setTreeData(rootNodes);
                    setExpandedNodes([currentDir]);
                } catch (error) {
                    console.error('Error loading initial directory:', error);
                }
            }
        };

        loadInitialData();
    }, [currentDir, loadChildren]);

    return (
        <SimpleTreeView
            expandedItems={expandedNodes}
            sx={{
                '& .MuiTreeItem-group': {
                    transition: 'none !important',
                    animation: 'none !important'
                },
                '& .MuiTreeItem-content': {
                    transition: 'none !important'
                }
            }}
        >
            {treeData.map(node => (
                <DirectoryNodeComponent
                    key={node.path}
                    node={node}
                    expandedNodes={expandedNodes}
                    onToggle={handleNodeToggle}
                />
            ))}
        </SimpleTreeView>
    );
}