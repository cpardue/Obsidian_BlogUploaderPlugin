import { Plugin, Notice, MenuItem, TFile, Editor, PluginSettingTab, Setting } from 'obsidian';
import axios from 'axios';

interface BlogUploaderSettings {
  githubPat: string;
  repoOwner: string;
  repoName: string;
  branch: string;
}

const DEFAULT_SETTINGS: Partial<BlogUploaderSettings> = {
  repoOwner: 'cpardue',
  repoName: 'cpardue.github.io',
  branch: 'main',
};

export default class BlogUploaderPlugin extends Plugin {
  settings: BlogUploaderSettings = {} as BlogUploaderSettings;

  async onload() {
    await this.loadSettings();

    this.addCommand({
      id: 'upload-to-blog',
      name: 'Upload to Blog',
      editorCallback: (editor: Editor) => {
        this.uploadToBlog(editor, null);
      },
    });

    this.addRibbonIcon('upload', 'Upload to Blog', (evt: MouseEvent) => {
      this.uploadToBlog(null, null);
    });

    this.registerEvent(
      this.app.workspace.on('file-menu', (menu: any, file: any) => {
        if (file instanceof TFile) {
          menu.addItem((item: MenuItem) => {
            item.setTitle('Upload to Blog')
              .setIcon('upload')
              .onClick(() => {
                this.uploadToBlog(null, file);
              });
          });
        }
      })
    );

    this.addSettingTab(new BlogUploaderSettingsTab(this));
  }

  async loadSettings(): Promise<void> {
    this.settings = {
      ...DEFAULT_SETTINGS,
      ...(await this.loadData()),
    } as BlogUploaderSettings;
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  async uploadToBlog(editor: Editor | null, file: TFile | null): Promise<void> {
    const noteTitle = file ? file.basename : editor?.getLine(0)?.trim() || 'Untitled';
    const content = editor
      ? editor.getValue()
      : file
        ? String(await this.app.vault.cachedRead(file))
        : '';

    const summary = prompt('Enter summary');
    if (summary === null) return;

    const categoriesInput = prompt('Enter categories (comma-separated)');
    if (categoriesInput === null) return;

    const tagsInput = prompt('Enter tags (comma-separated)');
    if (tagsInput === null) return;

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
      const response = await axios.post(
        `https://api.github.com/repos/${repoOwner}/${repoName}/contents/${filePath}`,
        {
          message: 'Upload Post',
          content: Buffer.from(markdownContent).toString('base64'),
          branch,
        },
        {
          headers: {
            Authorization: `token ${pat}`,
            'X-GitHub-Api-Version': '2022-11-28',
          },
        }
      );

      new Notice('Blog post uploaded successfully!');
      console.log('Upload response:', response.data);
    } catch (error) {
      console.error('Error uploading blog post:', error);
      const errorMessage = error instanceof Error ? error.message : String(error);
      new Notice(`Error uploading blog post: ${errorMessage}`);
    }
  }
}

class BlogUploaderSettingsTab extends PluginSettingTab {
  constructor(private plugin: BlogUploaderPlugin) {
    super(plugin.app, plugin);
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();
    containerEl.createEl('h2', { text: 'Blog Uploader Settings' });

    new Setting(containerEl)
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

    new Setting(containerEl)
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

    new Setting(containerEl)
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

    new Setting(containerEl)
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