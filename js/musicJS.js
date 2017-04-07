function app($node) {

    this.init($node)
    this.bind()
}
// 获取元素
app.prototype.init = function($node) {
    this.songHistory = []
    this.$audio = $('audio')
    this.$node = $node
    this.$show = $node.find('.show')
    this.$name = $node.find('.name')
    this.$author = $node.find('.author')
    this.$porp = this.$node.find('.porp')
    this.$prev = this.$node.find('.prev')
    this.$next = this.$node.find('.next')
    this.$showP = this.$node.find('.show-p')
    this.$controlP = $node.find('.control-p')
    this.$endTime = $node.find('.endTime')
    this.$nowTime = $node.find('.nowTime')
    this.$vprocess = $node.find('.v-process')
    this.$volumeC = $node.find('.volume-c')
    this.$lrcWrap = $node.find('.lrcWrap')
    this.$lyrics = $node.find('.lyrics')
    this.$lrcBtn = $node.find('.lrcBtn')
    this.$playlistBtn = $node.find('.playlistBtn')
    this.$playList = $node.find('.playList')
    this.$songName = $node.find('.name')
    this.$songListBtn = $node.find('.songListBtn')
    this.$songList = $node.find('.songList')
    this.$loop = $node.find('.loop')
}


// 绑定事件
app.prototype.bind = function() {
    var _this = this

    // 绑定暂停和播放按钮按钮的事件
    this.$porp.on('click', function() {
            if ($(this).hasClass('pause')) {
                _this.$audio[0].play()
                $(this).html('&#xe6d2;')
                $(this).removeClass('pause').addClass('play')
            } else if ($(this).hasClass('play')) {
                _this.$audio[0].pause()
                $(this).html('&#xe633;')
                $(this).removeClass('play').addClass('pause')
            }
        })
        // 绑定播放事件
    this.$audio.on('play', function() {
            $('.pause').html('&#xe6d2;').addClass('play').removeClass('pause')
        })
        // 绑定暂停事件
    this.$audio.on('pause', function() {
            $('.play').html('&#xe633;').addClass('pause').removeClass('play')
        })
        // 绑定歌曲播放时间更新状态
    this.$audio.on('timeupdate', function() {
            _this.process()
            _this.nowTime()
        })
        // 绑定歌曲加载完成事件
    this.$audio.on('loadeddata', function() {
            _this.endTime()
        })
        // 绑定歌曲正在开始播放事件
    this.$audio.on('playing', function() {
            _this.showNowSong()
        })
        // 结束自动切歌
    this.$audio.on('ended', function() {
            _this.getSong()
        })
        // 绑定切换下一首歌按钮点击事件
    this.$next.on('click', function() {
            _this.playNext()
        })
        // 绑定切换上一首歌按钮点击事件
    this.$prev.on('click', function() {
            _this.playPrev()
        })
        // 绑定歌曲进度条的点击事件
    this.$showP.on('click', function(e) {
            _this.controlProcess(e)
        })
        // 绑定音量控制条点击事件
    this.$vprocess.on('click', function(e) {
            _this.controlVolume(e)
        })
        // 歌词显示按钮点击事件
    this.$lrcBtn.on('click', function() {
            if ($(this).hasClass('showNow')) {
                $(this).removeClass('showNow')
                _this.$lrcWrap.animate({ 'opacity': 0 }, function() { _this.$lrcWrap.css({ 'display': 'none' }) })
            } else {
                $(this).addClass('showNow')
                _this.$lrcWrap.css({ 'display': 'block' }).animate({ 'opacity': 1 })
            }
        })
        // 播放历史列表显示按钮
    this.$playlistBtn.on('click', function() {
            _this.controlList()
        })
        // 播放历史列表歌曲选择
    this.$playList.on('click', 'li', function() {
            _this.controlListSong($(this))
        })
        // 歌单显示按钮点击事件
    this.$songListBtn.on('click', function() {
            _this.controSonglList()
            _this.getSongList()
        })
        // 点选歌单歌曲
    this.$songList.on('click', 'li', function() {
            _this.songlListHandler($(this))
        })
        // 循环播放
    this.$loop.on('click', function() {
        if ($(this).hasClass('showNow')) {
            $(this).removeClass('showNow')
            _this.$audio.removeAttr('loop')
        } else {
            $(this).addClass('showNow')
            _this.$audio.attr('loop', 'loop')
        }
    })

}

// 获取歌曲
app.prototype.getSong = function(n) {
        var _this = this
        $.ajax({
            url: 'http://api.jirengu.com/fm/getSong.php',
            dataType: 'jsonp',
            type: 'get',
            data: {
                'channel': n || 3
            }
        }).done(function(ret) {
            var a = ret.song[0],
                lrc = a.lrc
            _this.handlerInfo(a)
            _this.songHistory.push(a)
            _this.controlHistory()
            _this.getLyc(lrc)
        })
    }
    // 获取歌名和作者并放到元素上
app.prototype.handlerInfo = function(a) {
    this.$audio.attr('src', a.url)
    this.$show.css('background-image', 'url(' + a.picture + ')')
    this.$name.text(a.title)
    this.$author.text(a.artist)
}

// 切换下一首歌
app.prototype.playNext = function() {
    var src = this.$audio.attr('src')
    if (this.songHistory.length > 0) {
        for (var i = 0; i < this.songHistory.length; i++) {
            if (src === this.songHistory[i].url && src !== this.songHistory[this.songHistory.length - 1].url) {
                this.handlerInfo(this.songHistory[i + 1])
                this.getLyc(this.songHistory[i + 1].lrc)
            } else if (src === this.songHistory[this.songHistory.length - 1].url) {
                this.getSong()
                return
            }
        }
    } else {
        this.getSong()
    }
}

// 切换上一首
app.prototype.playPrev = function() {
    var src = this.$audio.attr('src')
    if (this.songHistory <= 1) {
        return
    } else {
        for (var i = 0; i < this.songHistory.length; i++) {
            if (src === this.songHistory[i].url && src !== this.songHistory[0].url) {
                this.handlerInfo(this.songHistory[i - 1])
                this.getLyc(this.songHistory[i - 1].lrc)
            }
        }
    }
    this.controlHistory()
}

// 进度条显示
app.prototype.process = function() {
        var totalLength = this.$audio[0].duration,
            currentTime = this.$audio[0].currentTime;
        this.$controlP.css({
            'width': (currentTime / totalLength) * 100 + '%'
        })
    }
    // 控制进度条
app.prototype.controlProcess = function(e) {
    var X = e.offsetX;
    this.$audio[0].currentTime = X / this.$showP.width() * this.$audio[0].duration
    this.process()
}

// 操控历史播放列表
app.prototype.controlHistory = function() {
    var str = ''
    for (var i = 0; i < this.songHistory.length; i++) {
        str += '<li>' + this.songHistory[i].title + '</li>'
    }
    this.$playList.html(str)
}

// 历史播放列表展示
app.prototype.controlList = function() {
    var _this = this
    if ($(window).width() < 770) {
        this.$songListBtn.removeClass('showList')
        this.$songList.css({ 'z-index': -1 })
        this.$songList.animate({ 'top': 267 }, 100, 'linear', function() {
            _this.$songList.css({ 'display': 'none' })
        })
        if (!this.$playlistBtn.hasClass('showList')) {
            this.$playlistBtn.addClass('showList')
            this.$playList.css({ 'display': 'block' })
                .animate({ 'top': 374 }, 100, 'linear', function() {
                    _this.$playList.css({ 'z-index': 0 })
                })
        } else {
            this.$playlistBtn.removeClass('showList')
            this.$playList.css({ 'z-index': -1 })
            this.$playList.animate({ 'top': 267 }, 100, 'linear', function() {
                _this.$playList.css({ 'display': 'none' })
            })
        }
    } else {
        this.$songListBtn.removeClass('showList')
        this.$songList.css({ 'z-index': -1 })
        this.$songList.animate({ 'left': 130 }, 100, 'linear', function() {
            _this.$songList.css({ 'display': 'none' })
        })
        if (!this.$playlistBtn.hasClass('showList')) {
            this.$playlistBtn.addClass('showList')
            this.$playList.css({ 'display': 'block' })
                .animate({ 'left': 330 }, 100, 'linear', function() {
                    _this.$playList.css({ 'z-index': 0 })
                })
        } else {
            this.$playlistBtn.removeClass('showList')
            this.$playList.css({ 'z-index': -1 })
            this.$playList.animate({ 'left': 130 }, 100, 'linear', function() {
                _this.$playList.css({ 'display': 'none' })
            })
        }
    }

}


// 展示现在播放的歌曲
app.prototype.showNowSong = function() {
    this.$playList.children().css({ 'color': '#aaa' })
    for (var i = 0; i < this.$playList.children().length; i++) {
        if (this.$songName.text() === $(this.$playList.children()[i]).text()) {
            $(this.$playList.children()[i]).css({ 'color': '#fc6c4e' })
        }
    }
}

// 点播历史播放列表
app.prototype.controlListSong = function($song) {
    var songName = $song.text()
    for (var i = 0; i < this.songHistory.length; i++) {
        if (songName === this.songHistory[i].title) {
            this.handlerInfo(this.songHistory[i])
            this.getLyc(this.songHistory[i].lrc)
        }
    }
}

// 获取歌单
app.prototype.getSongList = function() {
    var _this = this
    $.ajax({
        url: 'http://api.jirengu.com/fm/getChannels.php',
        dataType: 'jsonp',
        type: 'get'
    }).done(function(data) {
        _this.songlListShow(data)
    })
}

// 歌单列表
app.prototype.controSonglList = function() {
    var _this = this

    if ($(window).width() < 770) {
        this.$playlistBtn.removeClass('showList')
        this.$playList.css({ 'z-index': -1 })
        this.$playList.animate({ 'top': 267 }, 100, 'linear', function() {
            _this.$playList.css({ 'display': 'none' })
        })
        if (!this.$songListBtn.hasClass('showList')) {
            this.$songListBtn.addClass('showList')
            this.$songList.css({ 'display': 'block' })
                .animate({ 'top': 374 }, 100, 'linear', function() {
                    _this.$songList.css({ 'z-index': 0 })
                })
        } else {
            this.$songListBtn.removeClass('showList')
            this.$songList.css({ 'z-index': -1 })
            this.$songList.animate({ 'top': 267 }, 100, 'linear', function() {
                _this.$songList.css({ 'display': 'none' })
            })
        }
    } else {
        this.$playList.animate({ 'left': 130 }, 100, 'linear', function() {
            _this.$playList.css({ 'display': 'none' })
        })
        if (!this.$songListBtn.hasClass('showList')) {
            this.$songListBtn.addClass('showList')
            this.$songList.css({ 'display': 'block' })
                .animate({ 'left': 330 }, 100, 'linear', function() {
                    _this.$songList.css({ 'z-index': 0 })
                })
        } else {
            this.$songListBtn.removeClass('showList')
            this.$songList.css({ 'z-index': -1 })
            this.$songList.animate({ 'left': 130 }, 100, 'linear', function() {
                _this.$songList.css({ 'display': 'none' })
            })
        }
    }

}

// 歌单列表选项展示
app.prototype.songlListShow = function(data) {

    if (!this.$songList.hasClass('alread')) {
        var str = '',
            channels = data.channels
        for (var i = 0; i < channels.length; i++) {
            str += '<li>' + channels[i].name + '</li>'
        }
        this.$songList.html(str)
        this.$songList.addClass('alread')
    } else {
        return
    }
}

// 歌单歌曲点歌
app.prototype.songlListHandler = function($this) {
    this.$songList.children().css({ 'color': '#aaa' })
    $this.css({ 'color': '#fc6c4e' })
    this.getSong(this.$songList.children().index($this))
}


// 现在播放时间显示
app.prototype.nowTime = function() {
    var reg = /\d+/,
        cTime = reg.exec(this.$audio[0].currentTime)[0]
    min = parseInt(parseInt(cTime) / 60)
    second = cTime
    if (second < 10) {
        this.$nowTime.text('0' + min + ':' + '0' + second)
    } else if (second > 10 && second < 60) {
        this.$nowTime.text('0' + min + ':' + second)
    } else {
        second %= 60
        if (second < 10) {
            this.$nowTime.text('0' + min + ':' + '0' + second)
        } else {
            this.$nowTime.text('0' + min + ':' + second)
        }
    }
}

// 歌曲长度时间展示
app.prototype.endTime = function() {
    var min = parseInt(this.$audio[0].duration / 60),
        sec = parseInt(this.$audio[0].duration % 60)
    if (min < 10 && sec < 10) {
        this.$endTime.text('0' + min + ':' + '0' + sec)
    } else if (min < 10 && sec >= 10) {
        this.$endTime.text('0' + min + ':' + sec)
    } else if (min > 10 && sec < 10) {
        this.$endTime.text(min + ':' + '0' + sec)
    } else {
        this.$endTime.text(min + ':' + sec)
    }
}

// 控制音量
app.prototype.controlVolume = function(e) {
    var volume = this.$audio[0].volume,
        controlBarLen = this.$vprocess.width(),
        X = e.offsetX;
    this.$volumeC.width(volume)
    this.$audio[0].volume = X / controlBarLen
    this.$volumeC.width((X / controlBarLen) * 100 + '%')

}




// 获取歌词
app.prototype.getLyc = function(lrc) {
    var _this = this
    if (lrc) {
        $.ajax({
            url: lrc,
            type: 'get',
            dataType: 'text'
        }).done(function(text) {
            _this.operateLrc(text)
        })
    }
}

// 操纵歌词
app.prototype.operateLrc = function(text) {
    var _this = this
    var lyric = text.split('\n'),
        result = [],
        reg = /(\d{2}:{1}\d{2}.{1}\d{2})+/g
    this.$lyrics.html('')
    lyric.forEach(function(e, i, a) {
        if (reg.test(lyric[i]) && lyric[i].match(reg).length === 1) {
            var a = [];
            a[0] = lyric[i].match(reg)[0];
            a[1] = lyric[i].substring(lyric[i].lastIndexOf(']') + 1, lyric[i].length);
            result.push(a)
        } else if (reg.test(lyric[i]) && lyric[i].match(reg).length > 1) {
            lyric[i].match(reg).forEach(function(e1, i1, a1) {
                var b = [];
                b.push(lyric[i].match(reg)[i1]);
                b.push(lyric[i].substring(lyric[i].lastIndexOf(']') + 1, lyric[i].length));
                result.push(b);
            })
        }
    })
    result.forEach(function(e2, i2, a2) {
        a2[i2][0] = parseFloat(a2[i2][0].substring(3, a2[i2][0].length)) + parseInt(a2[i2][0]) * 60;
    })
    result = result.sort(function(a, b) {
        return a[0] - b[0];
    })
    result.forEach(function(e3, i3, a3) {
        var $li = $('<li>' + result[i3][1] + '</li>');
        _this.$lyrics.append($li)
    })
    this.$audio.on('timeupdate', function() {
        for (var x = 0; x < result.length; x++) {
            if (_this.$audio[0].currentTime > result[x][0]) {
                _this.$lyrics.css({
                    'top': -x * 30
                })
                _this.$lyrics.children().eq(x).css({
                    'color': '#fc6c4e'
                })
                var $now = _this.$lyrics.children();
                if (result[x + 1] !== undefined) {
                    if (_this.$audio[0].currentTime - result[x][0] > result[x + 1][0] - result[x][0]) {
                        $now.eq(x).css({
                            'color': 'white'
                        })
                    }
                }
            }
        }
    })
}

var b = new app($('#contain'))

$(function() {
    b.getSong()
});