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

export async function isSymmetricTree(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    const treeArr = JSON.stringify(testCase.tree).replace(/null/g, "null");
    
    // For C/CPP, use -9999 as null marker
    const cTreeArr = "{" + testCase.tree.map(x => x === null ? "-9999" : x).join(", ") + "}";
    const cSize = testCase.tree.length;

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>
#include<stdbool.h>

struct TreeNode {
    int val;
    struct TreeNode *left;
    struct TreeNode *right;
};

struct TreeNode* newNode(int val) {
    struct TreeNode* node = (struct TreeNode*)malloc(sizeof(struct TreeNode));
    node->val = val;
    node->left = NULL;
    node->right = NULL;
    return node;
}

// Queue-based construction
struct TreeNode* constructBst(int arr[], int n) {
    if(n==0) return NULL;
    struct TreeNode* root = newNode(arr[0]);
    
    struct TreeNode** queue = (struct TreeNode**)malloc(n * sizeof(struct TreeNode*));
    int front = 0, rear = 0;
    queue[rear++] = root;
    
    int i = 1;
    while(i < n && front < rear) {
        struct TreeNode* curr = queue[front++];
        
        if(i < n) {
            if(arr[i] != -9999) {
                curr->left = newNode(arr[i]);
                queue[rear++] = curr->left;
            }
            i++;
        }
        
        if(i < n) {
            if(arr[i] != -9999) {
                curr->right = newNode(arr[i]);
                queue[rear++] = curr->right;
            }
            i++;
        }
    }
    free(queue);
    return root;
}

${userCode}

int main(){
    int arr[] = ${cTreeArr};
    int n = ${cSize};
    
    struct TreeNode* root = constructBst(arr, n);
    
    // Convert boolean result to 1/0 for consistency
    int result = isSymmetric(root);
    printf("%d", result ? 1 : 0);
    
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
#include<queue>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode(int x) : val(x), left(NULL), right(NULL) {}
};

TreeNode* buildTree(const vector<int>& arr) {
    if (arr.empty()) return NULL;
    TreeNode* root = new TreeNode(arr[0]);
    queue<TreeNode*> q;
    q.push(root);
    int i = 1;
    while (i < arr.size()) {
        TreeNode* curr = q.front();
        q.pop();
        
        if (i < arr.size()) {
            if (arr[i] != -9999) {
                curr->left = new TreeNode(arr[i]);
                q.push(curr->left);
            }
            i++;
        }
        if (i < arr.size()) {
            if (arr[i] != -9999) {
                curr->right = new TreeNode(arr[i]);
                q.push(curr->right);
            }
            i++;
        }
    }
    return root;
}

${userCode}

int main(){
    vector<int> arr = ${cTreeArr};
    TreeNode* root = buildTree(arr);
    cout << (isSymmetric(root) ? 1 : 0);
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode(int x) { val = x; }
}

${userCode}

public class Main {
    public static TreeNode buildTree(Integer[] arr) {
        if (arr.length == 0 || arr[0] == null) return null;
        TreeNode root = new TreeNode(arr[0]);
        Queue<TreeNode> q = new LinkedList<>();
        q.add(root);
        int i = 1;
        while (i < arr.length) {
            TreeNode curr = q.poll();
            
            if (i < arr.length) {
                if (arr[i] != null) {
                    curr.left = new TreeNode(arr[i]);
                    q.add(curr.left);
                }
                i++;
            }
            if (i < arr.length) {
                if (arr[i] != null) {
                    curr.right = new TreeNode(arr[i]);
                    q.add(curr.right);
                }
                i++;
            }
        }
        return root;
    }

    public static void main(String[] args) {
        Solution sol = new Solution();
        Integer[] arr = ${treeArr};
        TreeNode root = buildTree(arr);
        System.out.print(sol.isSymmetric(root) ? 1 : 0);
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
function TreeNode(val) {
    this.val = val;
    this.left = this.right = null;
}

function buildTree(arr) {
    if (!arr.length) return null;
    let root = new TreeNode(arr[0]);
    let q = [root];
    let i = 1;
    while (i < arr.length) {
        let curr = q.shift();
        
        if (i < arr.length) {
            if (arr[i] !== null) {
                curr.left = new TreeNode(arr[i]);
                q.push(curr.left);
            }
            i++;
        }
        if (i < arr.length) {
            if (arr[i] !== null) {
                curr.right = new TreeNode(arr[i]);
                q.push(curr.right);
            }
            i++;
        }
    }
    return root;
}

${userCode}

const arr = ${treeArr};
const root = buildTree(arr);
// Ensure strict 1/0 output for boolean return
console.log(isSymmetric(root) ? 1 : 0);
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