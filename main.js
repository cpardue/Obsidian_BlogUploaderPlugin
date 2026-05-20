"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
}
Object.defineProperty(exports, "__esModule", { value: true });
const obsidian_1 = require("obsidian");
const axios_1 = __importDefault(require("axios"));
const DEFAULT_SETTINGS = {
    repoOwner: 'cpardue',
    repoName: 'cpardue.github.io',
    branch: 'main',
};
class BlogUploaderPlugin extends obsidian_1.Plugin {
    constructor() {
        super(...arguments);
        this.settings = {};
    }
    async onload() {
        await this.loadSettings();
        this.addCommand({
            id: 'upload-to-blog',
            name: 'Upload to Blog',
            editorCallback: (editor) => {
                this.uploadToBlog(editor, null);
            },
        });
        this.addRibbonIcon('upload', 'Upload to Blog', (evt) => {
            this.uploadToBlog(null, null);
        });
        this.registerEvent(this.app.workspace.on('file-menu', (menu, file) => {
            if (file instanceof obsidian_1.TFile) {
                menu.addItem((item) => {
                    item.setTitle('Upload to Blog')
                        .setIcon('upload')
                        .onClick(() => {
                        this.uploadToBlog(null, file);
                    });
                });
            }
        }));
        this.addSettingTab(new BlogUploaderSettingsTab(this));
    }
    async loadSettings() {
        this.settings = {
            ...DEFAULT_SETTINGS,
            ...(await this.loadData()),
        };
    }
    async saveSettings() {
        await this.saveData(this.settings);
    }
    async uploadToBlog(editor, file) {
        const noteTitle = file ? file.basename : editor?.getLine(0)?.trim() || 'Untitled';
        const content = editor
            ? editor.getValue()
            : file
                ? String(await this.app.vault.cachedRead(file))
                : '';
        const summary = prompt('Enter summary');
        if (summary === null)
            return;
        const categoriesInput = prompt('Enter categories (comma-separated)');
        if (categoriesInput === null)
            return;
        const tagsInput = prompt('Enter tags (comma-separated)');
        if (tagsInput === null)
            return;
        const categories = categoriesInput.split(',').map((t) => t.trim()).filter(Boolean);
        const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
        const now = new Date().toISOString().split('T')[0];
        const filename = `${now}-${noteTitle.replace(/\s+/g, '-')}.md`;
        const categoriesLine = categories.length > 0
            ? `categories: [${categories.map((tag) => `"${tag}"`).join(', ')}]`
            : '';
        const tagsLines = tags.length > 0
            ? `tags:\n${tags.map((tag) => `  - "${tag}"`).join('\n')}`
            : '';
        const frontmatter = `---
layout: post
title: "${noteTitle}"
date: "${now}"
summary: "${summary}"
${categoriesLine}
thumbnail: jekyll
${tagsLines}
---`;
        const markdownContent = `${frontmatter}\n${content}`;
        const pat = this.settings.githubPat || '';
        const repoOwner = this.settings.repoOwner;
        const repoName = this.settings.repoName;
        const branch = this.settings.branch;
        const filePath = `_posts/${filename}`;
        try {
            const response = await axios_1.default.post(`https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`, {
                message: 'Upload Post',
                content: Buffer.from(markdownContent).toString('base64'),
                branch,
            }, {
                headers: {
                    Authorization: `token ${pat}`,
                    'X-GitHub-Api-Version': '2022-11-28',
                },
            });
            new obsidian_1.Notice('Blog post uploaded successfully!');
            console.log('Upload response:', response.data);
        }
        catch (error) {
            console.error('Error uploading blog post:', error);
            const errorMessage = error instanceof Error ? error.message : String(error);
            new obsidian_1.Notice(`Error uploading blog post: ${errorMessage}`);
        }
    }
}
exports.default = BlogUploaderPlugin;
class BlogUploaderSettingsTab extends obsidian_1.PluginSettingTab {
    constructor(plugin) {
        super(plugin.app, plugin);
        this.plugin = plugin;
    }
    display() {
        const { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Blog Uploader Settings' });
        new obsidian_1.Setting(containerEl)
            .setName('GitHub Personal Access Token')
            .setDesc('Token with repo scope for GitHub API access')
            .addText((text) => {
            text.setPlaceholder('ghp_...')
                .inputEl.type = 'password';
            text.setValue(this.plugin.settings.githubPat || '');
            text.inputEl.addEventListener('blur', async () => {
                this.plugin.settings.githubPat = text.inputEl.value;
                await this.plugin.saveSettings();
            });
        });
        new obsidian_1.Setting(containerEl)
            .setName('Repository Owner')
            .setDesc('GitHub username or organization')
            .addText((text) => {
            text.setPlaceholder('cpardue')
                .setValue(this.plugin.settings.repoOwner || DEFAULT_SETTINGS.repoOwner || '');
            text.inputEl.addEventListener('blur', async () => {
                this.plugin.settings.repoOwner = text.inputEl.value;
                await this.plugin.saveSettings();
            });
        });
        new obsidian_1.Setting(containerEl)
            .setName('Repository Name')
            .setDesc('GitHub repository name')
            .addText((text) => {
            text.setPlaceholder('cpardue.github.io')
                .setValue(this.plugin.settings.repoName || DEFAULT_SETTINGS.repoName || '');
            text.inputEl.addEventListener('blur', async () => {
                this.plugin.settings.repoName = text.inputEl.value;
                await this.plugin.saveSettings();
            });
        });
        new obsidian_1.Setting(containerEl)
            .setName('Branch')
            .setDesc('Git branch to push to')
            .addText((text) => {
            text.setPlaceholder('main')
                .setValue(this.plugin.settings.branch || DEFAULT_SETTINGS.branch || '');
            text.inputEl.addEventListener('blur', async () => {
                this.plugin.settings.branch = text.inputEl.value;
                await this.plugin.saveSettings();
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1haW4udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSx1Q0FBOEY7QUFDOUYsa0RBQTBCO0FBUzFCLE1BQU0sZ0JBQWdCLEdBQWtDO0lBQ3RELFNBQVMsRUFBRSxTQUFTO0lBQ3BCLFFBQVEsRUFBRSxtQkFBbUI7SUFDN0IsTUFBTSxFQUFFLE1BQU07Q0FDZixDQUFDO0FBRUYsTUFBcUIsa0JBQW1CLFNBQVEsaUJBQU07SUFBdEQ7O1FBQ0UsYWFBUSxHQUF5QixFQUEwQixDQUFDO0lBc0g5RCxDQUFDO0lBcEhDLEtBQUssQ0FBQyxNQUFPO1FBQ2IsTUFBTSxJQUFJLENBQUMsWUFBWSxFQUFFLENBQUM7UUFFMUIsSUFBSSxDQUFDLFVBQVUsQ0FBQztZQUNkLEVBQUUsRUFBRSxnQkFBZ0I7WUFDcEIsSUFBSSxFQUFFLGdCQUFnQjtZQUN0QixjQUFjLEVBQUUsQ0FBQyxNQUFjLEVBQUUsRUFBRTtnQkFDakIsSUFBSSxDQUFDLFlBQVksQ0FBQyxNQUFNLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDbEMsQ0FBQztTQUNGLENBQUMsQ0FBQztRQUVILElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFFLENBQUMsR0FBZSxFQUFFLEVBQUU7WUFDakUsSUFBSSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7UUFDaEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxJQUFJLENBQUMsYUFBYSxDQUNoQixJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUMsV0FBVyxFQUFFLENBQUMsSUFBUyxFQUFFLElBQVMsRUFBRSxFQUFFO1lBQzFELElBQUksSUFBSSxZQUFZLGdCQUFLLEVBQUUsQ0FBQztnQkFDMUIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLElBQWMsRUFBRSxFQUFFO29CQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLGdCQUFnQixD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,