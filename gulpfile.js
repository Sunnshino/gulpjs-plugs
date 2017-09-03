// 采用了gulp-load-plugins后可能有些不支持init或无gulp前缀的，最好我们都采用分离以及驼峰命名。
// var let const定义.

// 未完成功能以及修复资料配置项!  包括时间戳、雪碧图...

let gulp = require('gulp'),
    del = require('del'),
    browserSync = require("browser-sync").create();
let $ = require('gulp-load-plugins')();

gulp.task('delete', function(cb) {
    return del(['dist/*', '!dist/images'], cb);
});

//压缩html  
gulp.task('html', function() {

    //开启关闭功能
    var options = {
        //清除HTML注释  
        removeComments: true,
        //压缩HTML
        collapseWhitespace: true,
        //删除<script>的type="text/javascript"  
        removeScriptTypeAttributes: true,
        //"text/css" 删除<style>和<link>的type= 
        removeStyleLinkTypeAttributes: true,
        //压缩js
        minifyJS: true,
        // 压缩css
        minifyCSS: true
    };
    // 路径选项
    var paths = {

        script: {
            src: 'src/js/**/*.js',
            dest: 'dev/js/',
            watch: 'src/js/**/*.js'
        },
        less: {
            src: 'src/less/',
            dest: 'dev/less/',
            watch: 'src/less'
        },
        images: {
            src: 'src/img/',
            dest: 'dev/img/',
            watch: 'src/img'
        },
        server: {
            src: 'src/server/',
            dest: 'dev/server/',
            watch: 'src/server'
        }
    };

    gulp.src('src/index.html')
        .pipe($.changed('dist', { hasChanged: $.changed.compareSha1Digest }))
        .pipe($.htmlmin(options))
        .pipe(gulp.dest('dist'))
        .pipe(browserSync.reload({ stream: true }));
});


//压缩js以及重命名 
gulp.task("script", function() {
    gulp.src(['src/js/jquery-3.1.0.min.js', 'src/js/index.js'])
        // 添加时间戳
        // .pipe($.ver.manifest())
        .pipe($.changed('dist/js', { hasChanged: $.changed.compareSha1Digest }))
        .pipe($.jshint())
        .pipe($.babel())
        .pipe($.jshint.reporter())
        .pipe($.concat('index.js'))
        .pipe($.uglify())
        .pipe($.rename('index.min.js'))
        .pipe($.obfuscate())
        .pipe(gulp.dest('dist/js'))
        .pipe(browserSync.reload({ stream: true }));
});

//实时编译less  
gulp.task('less', function() {
    gulp.src(['./src/less/*.less'])
        //多个文件以数组形式传入  
        .pipe($.changed('dist/css', { hasChanged: $.changed.compareSha1Digest }))
        .pipe($.less())
        // 小于8k的图片会被转码base64
        .pipe($.tobase64({
            maxsize: 8
        }))
        //编译less文件  
        .pipe($.concat('main.css'))
        //合并之后生成main.css  
        .pipe($.cleanCss())
        //压缩新生成的css  
        .pipe(gulp.dest('dist/css'))
        //将会在css下生成main.css  
        .pipe(browserSync.reload({ stream: true }));
});


// 压缩图片  
gulp.task('images', function() {
    gulp.src('./src/images/*.*')
        .pipe($.changed('dist/images', { hasChanged: $.changed.compareSha1Digest }))
        .pipe($.imagemin({
            progressive: true,
            // 无损压缩JPG图片  
            svgoPlugins: [{ removeViewBox: false }],
            // 不移除svg的viewbox属性  
            use: [$.imageminPngquant()]
                // 使用pngquant插件进行深度压缩  
        }))
        .pipe(gulp.dest('dist/images'))
        .pipe(browserSync.reload({ stream: true }));
});

//启动热更新  
gulp.task('server', ['delete'], function() {
    gulp.start('script', 'less', 'html');
    browserSync.init({
        port: 8086,
        server: {
            baseDir: ['dist']
        },
        livereload: true
    });
    gulp.watch('src/js/*.js', ['script']);
    //监控文件变化，自动更新  
    gulp.watch('src/less/*.less', ['less']);
    gulp.watch('src/*.html', ['html']);
    gulp.watch('src/images/*.*', ['images']);
});

gulp.task('default', ['server']);