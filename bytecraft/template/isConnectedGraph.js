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

export async function isConnectedGraph(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Create comma-separated string for C/Java/CPP: "0, 1, 1, 0, ..."
    const flatMatrixStr = testCase.matrix.join(", ");
    
    // For empty array safety
    const safeFlatMatrixStr = testCase.matrix.length > 0 ? flatMatrixStr : "0";

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>
#include<stdbool.h>

${userCode}

int main(){
    int V = ${testCase.v};
    int flatMatrix[] = {${safeFlatMatrixStr}};
    
    // Reconstruct 2D array (int**)
    int** adj = (int**)malloc(V * sizeof(int*));
    for(int i=0; i<V; i++) {
        adj[i] = (int*)malloc(V * sizeof(int));
        for(int j=0; j<V; j++) {
            adj[i][j] = flatMatrix[i * V + j];
        }
    }
    
    printf("%d", isConnected(V, adj));
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
#include<queue>
using namespace std;

${userCode}

int main(){
    int V = ${testCase.v};
    vector<int> flatMatrix = {${safeFlatMatrixStr}};
    
    // Reconstruct 2D Vector
    vector<vector<int>> adj(V, vector<int>(V));
    for(int i=0; i<V; i++) {
        for(int j=0; j<V; j++) {
            adj[i][j] = flatMatrix[i * V + j];
        }
    }
    
    cout << isConnected(V, adj);
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
        int[] flatMatrix = {${safeFlatMatrixStr}};
        
        // Reconstruct 2D Array
        int[][] adj = new int[V][V];
        for(int i=0; i<V; i++) {
            for(int j=0; j<V; j++) {
                adj[i][j] = flatMatrix[i * V + j];
            }
        }
        
        System.out.print(sol.isConnected(V, adj));
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
${userCode}

const V = ${testCase.v};
const flatMatrix = [${flatMatrixStr}];
const adj = [];

// Reconstruct 2D Array
for(let i=0; i<V; i++) {
    const row = [];
    for(let j=0; j<V; j++) {
        row.push(flatMatrix[i * V + j]);
    }
    adj.push(row);
}

console.log(isConnected(V, adj));
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
        passed: parseInt(response.run.output.trim()) === testCase.expected,
        output: response.run.output
    };
}