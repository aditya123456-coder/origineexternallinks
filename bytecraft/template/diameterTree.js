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
    javascript: { language: "javascript", version: "18.15.0" }
};

export async function diameterTree(userCode, testCase, currentlang) {
    let lang = LANGUAGE_CONFIG[currentlang];
    let fullcode = null;

    const treeArr = JSON.stringify(testCase.tree).replace(/null/g, "null");
    // Use -9999 as null marker for C/CPP array initialization
    const cTreeArr = "{" + testCase.tree.map(x => x === null ? "-9999" : x).join(", ") + "}";
    const cSize = testCase.tree.length;

    if (currentlang == "c") {
        fullcode = `#include<stdio.h>
#include<stdlib.h>

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

struct TreeNode* buildTree(int arr[], int n) {
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
    struct TreeNode* root = buildTree(arr, n);
    printf("%d", diameterOfBinaryTree(root));
    return 0;
}`;
    }
    else if (currentlang == "cpp") {
        fullcode = `#include<iostream>
#include<vector>
#include<queue>
#include<algorithm>
using namespace std;

struct TreeNode {
    int val;
    TreeNode *left;
    TreeNode *right;
    TreeNode() : val(0), left(nullptr), right(nullptr) {}
    TreeNode(int x) : val(x), left(nullptr), right(nullptr) {}
    TreeNode(int x, TreeNode *left, TreeNode *right) : val(x), left(left), right(right) {}
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
    cout << diameterOfBinaryTree(root);
    return 0;
}`;
    }
    else if (currentlang == "java") {
        fullcode = `import java.util.*;

class TreeNode {
    int val;
    TreeNode left;
    TreeNode right;
    TreeNode() {}
    TreeNode(int val) { this.val = val; }
    TreeNode(int val, TreeNode left, TreeNode right) {
        this.val = val;
        this.left = left;
        this.right = right;
    }
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
        System.out.print(sol.diameterOfBinaryTree(root));
    }
}`;
    }
    else if (currentlang == "javascript") {
        fullcode = `
function TreeNode(val, left, right) {
    this.val = (val===undefined ? 0 : val)
    this.left = (left===undefined ? null : left)
    this.right = (right===undefined ? null : right)
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
console.log(diameterOfBinaryTree(root));
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