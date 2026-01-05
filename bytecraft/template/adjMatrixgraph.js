function executeCode(code, lang) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "https://emkc.org/api/v2/piston/execute",
            type: "POST",
            contentType: "application/json",
            data: JSON.stringify({
                language: lang.language,
                version: lang.version,
                files: [{ content: code }]
            }),
            success: resolve,
            error: reject
        });
    });
}

const LANGUAGE_CONFIG = {
    c: { language: "c", version: "10.2.0" },
    cpp: { language: "cpp", version: "10.2.0" },
    java: { language: "java", version: "15.0.2" },
    kotlin: { language: "kotlin", version: "1.8.0" },
    python: { language: "python", version: "3.11.0" },
    javascript: { language: "javascript", version: "18.15.0" },
    typescript: { language: "typescript", version: "5.0.3" },
    php: { language: "php", version: "8.2.3" },
    ruby: { language: "ruby", version: "3.2.2" },
    rust: { language: "rust", version: "1.68.2" },
    go: { language: "go", version: "1.20.2" },
    csharp: { language: "csharp", version: "6.12.0" },
    swift: { language: "swift", version: "5.8.1" },
    bash: { language: "bash", version: "5.2.0" }
};

export async function adjMatrixgraph(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Create comma-separated string for C/Java/CPP: "0, 1, 1, 2"
    const flatEdgesStr = testCase.edges.join(", ");
    // For Empty case
    const safeFlatEdgesStr = testCase.edges.length > 0 ? flatEdgesStr : "0"; 

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

${userCode}

int main(){
    int V = ${testCase.v};
    // Flat array input
    int flatEdges[] = {${safeFlatEdgesStr}};
    int totalItems = ${testCase.edges.length};
    int E = totalItems / 2;
    
    // Reconstruct 2D array for user function
    // Handle E=0 case by allocating size 1 to prevent compiler errors
    int edges[E > 0 ? E : 1][2];
    
    if (E > 0) {
        for(int i=0; i<E; i++) {
            edges[i][0] = flatEdges[2*i];
            edges[i][1] = flatEdges[2*i+1];
        }
    }
    
    int returnSize;
    int* returnColumnSizes;
    
    int** result = createAdjMatrix(V, E, edges, &returnSize, &returnColumnSizes);
    
    for(int i=0; i<returnSize; i++) {
        for(int j=0; j<returnColumnSizes[i]; j++) {
            printf("%d", result[i][j]);
            if(j < returnColumnSizes[i] - 1) printf(" ");
        }
        if(i < returnSize - 1) printf("\\n");
    }
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
using namespace std;

${userCode}

int main(){
    int V = ${testCase.v};
    vector<int> flatEdges = {${safeFlatEdgesStr}};
    int E = ${testCase.edges.length} / 2;
    
    // Reconstruct 2D vector
    vector<vector<int>> edges;
    if (E > 0) {
        for(int i=0; i<E; i++) {
            vector<int> edge;
            edge.push_back(flatEdges[2*i]);
            edge.push_back(flatEdges[2*i+1]);
            edges.push_back(edge);
        }
    }
    
    vector<vector<int>> result = createAdjMatrix(V, edges);
    
    for(size_t i=0; i<result.size(); i++) {
        for(size_t j=0; j<result[i].size(); j++) {
            cout << result[i][j];
            if(j < result[i].size() - 1) cout << " ";
        }
        if(i < result.size() - 1) cout << "\\n";
    }
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

${userCode}

public class Main {
    public static void main(String[] args) {
        Solution sol = new Solution();
        int V = ${testCase.v};
        int[] flatEdges = {${safeFlatEdgesStr}};
        int E = ${testCase.edges.length} / 2;
        
        // Reconstruct 2D array
        int[][] edges = new int[E][2];
        if (E > 0) {
            for(int i=0; i<E; i++) {
                edges[i][0] = flatEdges[2*i];
                edges[i][1] = flatEdges[2*i+1];
            }
        }
        
        int[][] result = sol.createAdjMatrix(V, edges);
        
        for(int i=0; i<result.length; i++) {
            for(int j=0; j<result[i].length; j++) {
                System.out.print(result[i][j]);
                if(j < result[i].length - 1) System.out.print(" ");
            }
            if(i < result.length - 1) System.out.print("\\n");
        }
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
${userCode}

const V = ${testCase.v};
const flatEdges = [${flatEdgesStr}];
const edges = [];

// Reconstruct 2D array
for(let i=0; i<flatEdges.length; i+=2) {
    edges.push([flatEdges[i], flatEdges[i+1]]);
}

const result = createAdjMatrix(V, edges);

// Print formatted
for(let i=0; i<result.length; i++) {
    console.log(result[i].join(" "));
}
`;
    }

    const response = await executeCode(fullcode, lang);

    if (response.run.code !== 0) {
        return {
            passed: false,
            output: response.run.stderr || response.run.output
        };
    }

    return {
        passed: response.run.output.trim() === testCase.expected.trim(),
        output: response.run.output
    };
}