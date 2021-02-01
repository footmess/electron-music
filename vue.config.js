module.exports = {
    lintOnSave: false,
    chainWebpack: config => {
        config.target("electron-renderer");
    },
    pluginOptions: {
        electronBuilder: {
            builderOptions: {
                appId: 'com.electron.zzplayer',
                productName: 'MyPlayer',
                publish: ['github'],
                fileAssociations: [
                    { ext: ['mp3', 'wav', 'flac', 'ogg', 'm4a'], name: 'music', role: 'Editor' }
                ],
                win: {
                    icon: 'public/orange.icon'
                },
                nsis: {
                    // 是否自动安装
                    oneClick: false,
                    // 是否允许修改安装目录
                    allowToChangeInstallationDirectory: true
                }
            }
        }
    }
}
