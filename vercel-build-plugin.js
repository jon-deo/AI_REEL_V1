const { execSync } = require('child_process');

module.exports = {
    name: 'ffmpeg-installer',
    async build() {
        console.log('Installing FFmpeg...');
        try {
            execSync('apt-get update && apt-get install -y ffmpeg', { stdio: 'inherit' });
            console.log('FFmpeg installed successfully');
        } catch (error) {
            console.error('Failed to install FFmpeg:', error);
            throw error;
        }
    }
}; 