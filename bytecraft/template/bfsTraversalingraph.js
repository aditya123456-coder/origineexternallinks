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

export async function bfsTraversalingraph(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;
    
    // Create comma-separated string for C/Java/CPP: "0, 1, 0, 0, ..."
    const flatMatrixStr = testCase.matrix.join(", ");
    const safeFlatMatrixStr = testCase.matrix.length > 0 ? flatMatrixStr : "0";

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>
#include<stdbool.h>

${userCode}

int main(){
    int V = ${testCase.v};
    int flatMatrix[] = {${safeFlatMatrixStr}};
    
    // Reconstruct 2D array
    int** adj = (int**)malloc(V * sizeof(int*));
    for(int i=0; i<V; i++) {
        adj[i] = (int*)malloc(V * sizeof(int));
        for(int j=0; j<V; j++) {
            adj[i][j] = flatMatrix[i * V + j];
        }
    }
    
    int returnSize = 0;
    int* result = bfsTraversal(V, adj, &returnSize);
    
    for(int i=0; i<returnSize; i++) {
        printf("%d", result[i]);
        if(i < returnSize - 1) printf(" ");
    }
    
    // Cleanup (Optional in online judge but good practice)
    free(result);
    for(int i=0; i<V; i++) free(adj[i]);
    free(adj);
    
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
#include<queue>
#include<algorithm>
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
    
    vector<int> result = bfsTraversal(V, adj);
    
    for(size_t i=0; i<result.size(); i++) {
        cout << result[i];
        if(i < result.size() - 1) cout << " ";
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
        int[] flatMatrix = {${safeFlatMatrixStr}};
        
        // Reconstruct 2D Array
        int[][] adj = new int[V][V];
        for(int i=0; i<V; i++) {
            for(int j=0; j<V; j++) {
                adj[i][j] = flatMatrix[i * V + j];
            }
        }
        
        ArrayList<Integer> result = sol.bfsTraversal(V, adj);
        
        for(int i=0; i<result.size(); i++) {
            System.out.print(result.get(i));
            if(i < result.size() - 1) System.out.print(" ");
        }
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

const result = bfsTraversal(V, adj);
console.log(result.join(" "));
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
        passed: response.run.output.trim() === testCase.expected,
        output: response.run.output
    };
}