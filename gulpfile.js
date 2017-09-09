/*
    目录结构:
        test(主目录)
            src(输入路径)
                index.html(主页面)
                js(文件夹)
                less(文件夹)
                images(文件夹)
                html(文件夹)
            dest(输出路径)
                js(文件夹)
                less(文件夹)
                img(文件夹)
                html(文件夹)
                
        说明:
        paths里面有:
            script:
                src:来自路径
                dest:目的路径
                watch:监听路径
*/
let gulp = require('gulp'),
    del = require('del'),
    browserSync = require("browser-sync").create();
let $ = require('gulp-load-plugins')();


// 路径选项
var paths = {
    script: {
        src: 'src/js/*.js',
        dest: 'dest/js/',
        watch: 'src/js/*.js'
    },
    less: {
        src: 'src/less/*.less',
        dest: 'dest/less/',
        watch: 'src/less'
    },
    images: {
        src: 'src/images/*.*',
        dest: 'dest/img/',
        watch: 'src/images/*.*'
    },
    html: {
        src: 'src/html/*.html',
        dest: 'dest/html',
        watch: 'src/*.html'
    }
};

gulp.task('delete', function(cb) {
    return del(['dest/*', '!dest/images'], cb);
});


// 文件热更新
// gulp.task('reload', function() {
//     gulp.src('/')
//         .pipe($.connect.reload())
//     console.log('html change!')
// });

//压缩html  
gulp.task('html', function() {
    var options = {
        removeComments: true,
        collapseWhitespace: true,
        removeScriptTypeAttributes: true,
        removeStyleLinkTypeAttributes: true,
        minifyJS: true,
        minifyCSS: true
    };
    // 来自
    gulp.src('src/index.html')
        .pipe($.changed('dest', { hasChanged: $.changed.compareSha1Digest }))
        .pipe($.htmlmin(options))
        .pipe(gulp.dest('dest'))
        .pipe(browserSync.reload({ stream: true }));
});


//压缩js以及重命名 
gulp.task("script", function() {
    // 来自路径
    gulp.src(['src/js/jquery.js', 'src/js/index.js'])
        .pipe($.changed(paths.script.dest, { hasChanged: $.changed.compareSha1Digest }))
        .pipe($.jshint())
        .pipe($.babel())
        .pipe($.jshint.reporter())
        .pipe($.concat('index.js'))
        .pipe($.uglify())
        .pipe($.rename('index.min.js'))
        .pipe($.obfuscate())
        .pipe(gulp.dest(paths.script.dest))
        .pipe(browserSync.reload({ stream: true }));
});

//实时编译less  
gulp.task('less', function() {
    gulp.src([paths.less.src])
        .pipe($.changed(paths.less.src, { hasChanged: $.changed.compareSha1Digest }))
        .pipe($.less())
        .pipe($.tobase64({
            maxsize: 8
        }))
        .pipe($.concat('main.css'))
        .pipe($.cleanCss())
        .pipe(gulp.dest(paths.less.dest))
        .pipe(browserSync.reload({ stream: true }));
});


// 压缩图片  
gulp.task('images', function() {
    gulp.src(paths.images.src)
        .pipe($.changed(paths.images.dest, { hasChanged: $.changed.compareSha1Digest }))
        .pipe($.imagemin({
            progressive: true,
            svgoPlugins: [{ removeViewBox: false }],
            // use: [$.imageminPngquant()]
        }))
        .pipe(gulp.dest(paths.images.dest))
        .pipe(browserSync.reload({ stream: true }));
});

//启动服务器热加载  
gulp.task('server', ['delete'], function() {
    gulp.start('html', 'less', 'script', 'images');
    browserSync.init({
        port: 8088,
        server: {
            baseDir: ['dest']
        },
        livereload: true
    });

    //监控文件变化，自动更新(自添加规则) 
    gulp.watch(paths.script.watch, ['script']);
    gulp.watch(paths.less.watch, ['less']);
    gulp.watch(paths.html.watch, ['html']);
    gulp.watch(paths.images.watch, ['images']);
});

gulp.task('default', ['server']);