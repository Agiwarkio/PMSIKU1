import React from 'react';

interface MarkdownRendererProps {
    text: string;
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ text }) => {
    const renderLine = (line: string, index: number) => {
        if (line.startsWith('# ')) {
            return <h1 key={index} className="text-2xl font-bold mt-6 mb-4 text-slate-900 dark:text-slate-100">{line.substring(2)}</h1>;
        }
        if (line.startsWith('## ')) {
            return <h2 key={index} className="text-xl font-bold mt-5 mb-3 text-slate-800 dark:text-slate-200">{line.substring(3)}</h2>;
        }
        if (line.startsWith('### ')) {
            return <h3 key={index} className="text-lg font-bold mt-4 mb-2 text-slate-800 dark:text-slate-200">{line.substring(4)}</h3>;
        }
        if (line.startsWith('- ')) {
            const content = line.substring(2);
            const contentParts = content.split(/(\*\*.*?\*\*)/g).map((part, i) => {
                if (part.startsWith('**') && part.endsWith('**')) {
                    return <strong key={i}>{part.slice(2, -2)}</strong>;
                }
                return part;
            });
            return <li key={index} className="ml-5 list-disc">{contentParts}</li>;
        }
        
        const parts = line.split(/(\*\*.*?\*\*)/g).map((part, i) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={i}>{part.slice(2, -2)}</strong>;
            }
            return part;
        });

        if (line.trim() === '') {
            return null; // Don't render empty lines as paragraphs
        }
        return <p key={index}>{parts}</p>;
    };

    const lines = text.split('\n');
    // FIX: Use React.ReactElement to avoid "Cannot find namespace 'JSX'" error.
    const elements: React.ReactElement[] = [];
    let listItems: string[] = [];

    lines.forEach((line, index) => {
        if (line.startsWith('- ')) {
            listItems.push(line);
        } else {
            if (listItems.length > 0) {
                elements.push(
                    <ul key={`ul-${index}`} className="space-y-1">
                        {listItems.map((item, itemIndex) => renderLine(item, itemIndex))}
                    </ul>
                );
                listItems = [];
            }
            const renderedLine = renderLine(line, index);
            if (renderedLine) {
                elements.push(renderedLine);
            }
        }
    });

    if (listItems.length > 0) {
        elements.push(
            <ul key={`ul-end`} className="space-y-1">
                {listItems.map((item, itemIndex) => renderLine(item, itemIndex))}
            </ul>
        );
    }

    return (
        <div className="space-y-2 text-slate-700 dark:text-slate-300">
            {elements}
        </div>
    );
};

export default MarkdownRenderer;