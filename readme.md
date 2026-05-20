# Obsidian BlogUploaderPlugin

This plugin allows you to upload Obsidian notes to a GitHub repository as blog posts. Follow the steps below to install and use the plugin.

## Prerequisites

1. **Obsidian Installed**: Ensure you have Obsidian installed on your Windows system.
2. **GitHub Account**: You need a GitHub account with a repository where you want to upload the blog posts.
3. **Personal Access Token (PAT)**: Generate a GitHub PAT with the necessary permissions (e.g., `repo`).

## Installation Steps

### 1. Clone the Repository

Open a terminal and navigate to the directory where you want to clone the repository. Then, run the following command:

```shell
git clone https://github.com/cpardue/Obsidian_BlogUploaderPlugin.git
```

### 2. Open Obsidian

Launch Obsidian and open your vault.

### 3. Install the Plugin

1. Open the Obsidian settings by navigating to `Settings > Community plugins`.
2. Click on the `Install from disk` button.
3. Navigate to the `Obsidian_BlogUploaderPlugin` folder you cloned earlier and select the `main.ts` file.
4. Click `Install` to install the plugin.

### 4. Configure the Plugin

1. After installation, the plugin will appear in the list of installed plugins.
2. Click on the `Settings` button next to the plugin to open the configuration options.
3. Enter your GitHub Personal Access Token (PAT) in the appropriate field.
4. Save the settings to apply the changes.

## Usage Steps

### 1. Write Your Blog Post

1. Create a new note in Obsidian or open an existing note that you want to upload as a blog post.
2. Ensure the note has a title on the first line (e.g., `# My Blog Post`).

### 2. Upload the Blog Post

1. Right-click on the note in the file explorer or use the ribbon icon to open the "Upload to Blog" menu.
2. Fill in the required fields:
   - **Summary**: A brief summary of the blog post.
   - **Categories**: Categories for the blog post (comma-separated).
   - **Tags**: Tags for the blog post (comma-separated).
3. Click the "Upload" button to upload the blog post to your GitHub repository.

### 3. Verify the Upload

1. Once the upload is complete, you should see a confirmation message.
2. Check your GitHub repository to verify that the blog post has been uploaded correctly.

## Troubleshooting

- **Error Messages**: If you encounter any errors, they will be displayed in a notice within Obsidian.
- **Error Logs**: Error logs will be saved to a local file named `plugin-error.log` in your Obsidian vault directory.

## Contributing

If you have any suggestions or improvements, feel free to fork the repository and submit a pull request.

## License

This plugin is licensed under the MIT License. See the [LICENSE](LICENSE) file for more details.
