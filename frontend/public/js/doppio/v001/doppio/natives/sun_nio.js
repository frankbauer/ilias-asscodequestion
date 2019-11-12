"use strict";function getStringFromHeap(a,b){for(var c=a.getJVM().getHeap(),d=b.toNumber(),e=0;0!==c.get_signed_byte(d+e);)e++;return c.get_buffer(d,e).toString()}function stringToByteArray(a,b){if(!b)return null;for(var c=new Buffer(b,"utf8"),d=c.length,e=util.newArray(a,a.getBsCl(),"[B",d),f=0;d>f;f++)e.array[f]=c.readUInt8(f);return e}function convertError(a,b,c){a.setStatus(ThreadStatus.ASYNC_WAITING),"ENOENT"===b.code?a.getBsCl().initializeClass(a,"Ljava/nio/file/NoSuchFileException;",function(c){var d=c.getConstructor(a),e=new d(a);e["<init>(Ljava/lang/String;)V"](a,[util.initString(a.getBsCl(),b.path)],function(b){a.throwException(e)})}):"EEXIST"===b.code?a.getBsCl().initializeClass(a,"Ljava/nio/file/FileAlreadyExistsException;",function(d){var e=d.getConstructor(a),f=new e(a);f["<init>(Ljava/lang/String;)V"](a,[util.initString(a.getBsCl(),b.path)],function(a){c(f)})}):a.getBsCl().initializeClass(a,"Lsun/nio/fs/UnixException;",function(d){a.getBsCl().initializeClass(a,"Lsun/nio/fs/UnixConstants;",function(e){var f=d.getConstructor(a),g=new f(a),h=e.getConstructor(a),i=h["sun/nio/fs/UnixConstants/"+b.code];"number"!=typeof i&&(i=-1),g["sun/nio/fs/UnixException/errno"]=i,g["sun/nio/fs/UnixException/msg"]=util.initString(a.getBsCl(),b.message),c(g)})})}function convertStats(a,b){b["sun/nio/fs/UnixFileAttributes/st_mode"]=a.mode,b["sun/nio/fs/UnixFileAttributes/st_ino"]=Long.fromNumber(a.ino),b["sun/nio/fs/UnixFileAttributes/st_dev"]=Long.fromNumber(a.dev),b["sun/nio/fs/UnixFileAttributes/st_rdev"]=Long.fromNumber(a.rdev),b["sun/nio/fs/UnixFileAttributes/st_nlink"]=a.nlink,b["sun/nio/fs/UnixFileAttributes/st_uid"]=a.uid,b["sun/nio/fs/UnixFileAttributes/st_gid"]=a.gid,b["sun/nio/fs/UnixFileAttributes/st_size"]=Long.fromNumber(a.size);var c=date2components(a.atime),d=date2components(a.mtime),e=date2components(a.ctime);b["sun/nio/fs/UnixFileAttributes/st_atime_sec"]=Long.fromNumber(c[0]),b["sun/nio/fs/UnixFileAttributes/st_atime_nsec"]=Long.fromNumber(c[1]),b["sun/nio/fs/UnixFileAttributes/st_mtime_sec"]=Long.fromNumber(d[0]),b["sun/nio/fs/UnixFileAttributes/st_mtime_nsec"]=Long.fromNumber(d[1]),b["sun/nio/fs/UnixFileAttributes/st_ctime_sec"]=Long.fromNumber(e[0]),b["sun/nio/fs/UnixFileAttributes/st_ctime_nsec"]=Long.fromNumber(e[1]),b["sun/nio/fs/UnixFileAttributes/st_birthtime_sec"]=Long.fromNumber(Math.floor(a.birthtime.getTime()/1e3))}function flagTest(a,b){return(a&b)===b}function flag2nodeflag(a,b){if(null===UnixConstants){var c=a.getBsCl().getInitializedClass(a,"Lsun/nio/fs/UnixConstants;");if(null===c)return a.throwNewException("Ljava/lang/InternalError;","UnixConstants is not initialized?"),null;UnixConstants=c.getConstructor(a)}var d=flagTest(b,UnixConstants["sun/nio/fs/UnixConstants/O_SYNC"])||flagTest(b,UnixConstants["sun/nio/fs/UnixConstants/O_DSYNC"]),e=flagTest(b,UnixConstants["sun/nio/fs/UnixConstants/O_EXCL"]|UnixConstants["sun/nio/fs/UnixConstants/O_CREAT"]);return flagTest(b,UnixConstants["sun/nio/fs/UnixConstants/O_RDONLY"])?d?"rs":"r":flagTest(b,UnixConstants["sun/nio/fs/UnixConstants/O_WRONLY"])?b&UnixConstants["sun/nio/fs/UnixConstants/O_APPEND"]?e?"ax":"a":e?"wx":"w":flagTest(b,UnixConstants["sun/nio/fs/UnixConstants/O_RDWR"])?flagTest(b,UnixConstants["sun/nio/fs/UnixConstants/O_APPEND"])?e?"ax+":"a+":flagTest(b,UnixConstants["sun/nio/fs/UnixConstants/O_CREAT"])?e?"wx+":"w+":d?"rs+":"r+":(a.throwNewException("Lsun/nio/fs/UnixException;","Invalid open flag: "+b+"."),null)}function throwNodeError(a,b){convertError(a,b,function(b){a.throwException(b)})}function date2components(a){var b=a.getTime();return[Math.floor(b/1e3),b%1e3*1e6]}var Doppio=require("../doppiojvm"),util=Doppio.VM.Util,Long=Doppio.VM.Long,ThreadStatus=Doppio.VM.Enums.ThreadStatus,fs=require("fs"),sun_nio_ch_FileChannelImpl=function(){function a(){}return a["map0(IJJ)J"]=function(a,b,c,d,e){return a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented."),null},a["unmap0(JJ)I"]=function(a,b,c){return a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented."),0},a["position0(Ljava/io/FileDescriptor;J)J"]=function(a,b,c,d){return Long.fromNumber(d.equals(Long.NEG_ONE)?c.$pos:c.$pos=d.toNumber())},a["initIDs()J"]=function(a){return Long.fromNumber(4096)},a}(),sun_nio_ch_NativeThread=function(){function a(){}return a["current()J"]=function(a){return Long.fromNumber(-1)},a["signal(J)V"]=function(a,b){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["init()V"]=function(a){},a}(),sun_nio_ch_IOUtil=function(){function a(){}return a["iovMax()I"]=function(a){return 0},a}(),sun_nio_ch_FileDispatcherImpl=function(){function a(){}return a["init()V"]=function(a){},a["read0(Ljava/io/FileDescriptor;JI)I"]=function(a,b,c,d){var e=b["java/io/FileDescriptor/fd"],f=c.toNumber(),g=a.getJVM().getHeap().get_buffer(f,d);a.setStatus(ThreadStatus.ASYNC_WAITING),fs.read(e,g,0,d,null,function(b,c){b?a.throwNewException("Ljava/io/IOException;","Error reading file: "+b):a.asyncReturn(c)})},a["preClose0(Ljava/io/FileDescriptor;)V"]=function(a,b){},a["close0(Ljava/io/FileDescriptor;)V"]=function(b,c){a["closeIntFD(I)V"](b,c["java/io/FileDescriptor/fd"])},a["size0(Ljava/io/FileDescriptor;)J"]=function(a,b){var c=b["java/io/FileDescriptor/fd"];a.setStatus(ThreadStatus.ASYNC_WAITING),fs.fstat(c,function(b,c){b?throwNodeError(a,b):a.asyncReturn(Long.fromNumber(c.size),null)})},a["truncate0(Ljava/io/FileDescriptor;J)I"]=function(a,b,c){var d=b["java/io/FileDescriptor/fd"];a.setStatus(ThreadStatus.ASYNC_WAITING),fs.ftruncate(d,c.toNumber(),function(b){b?throwNodeError(a,b):a.asyncReturn(0)})},a["closeIntFD(I)V"]=function(a,b){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.close(b,function(b){b?throwNodeError(a,b):a.asyncReturn()})},a}(),DirFd=function(){function a(a){this._pos=0,this._listing=a}return a.prototype.next=function(){var a=this._listing[this._pos++];return void 0===a&&(a=null),a},a}(),FDMap=function(){function a(){this._map={}}return a.prototype.newEntry=function(b){var c=a._nextFd++;return this._map[c]=b,c},a.prototype.removeEntry=function(a,b,c){this._map[b]?delete this._map[b]:a.throwNewException(c,"Invalid file descriptor: "+b)},a.prototype.getEntry=function(a,b,c){var d=this._map[c];return d?d:(a.throwNewException(b,"Invalid file descriptor: "+c),null)},a._nextFd=1,a}(),dirMap=new FDMap,fileMap=new FDMap,UnixConstants=null,sun_nio_fs_UnixNativeDispatcher=function(){function a(){}return a["getcwd()[B"]=function(a){var b,c=new Buffer(process.cwd()+"\x00","utf8"),d=c.length,e=util.newArray(a,a.getBsCl(),"[B",d);for(b=0;d>b;b++)e.array[b]=c.readInt8(b);return e},a["dup(I)I"]=function(a,b){return a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented."),0},a["open0(JII)I"]=function(a,b,c,d){var e=flag2nodeflag(a,c);if(null!==e){a.setStatus(ThreadStatus.ASYNC_WAITING);var f=getStringFromHeap(a,b);fs.open(f,e,d,function(b,c){b?throwNodeError(a,b):a.asyncReturn(c)})}},a["openat0(IJII)I"]=function(a,b,c,d,e){return a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented."),0},a["close(I)V"]=function(a,b){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.close(b,function(b){b?throwNodeError(a,b):a.asyncReturn()})},a["fopen0(JJ)J"]=function(a,b,c){a.setStatus(ThreadStatus.ASYNC_WAITING);var d=getStringFromHeap(a,b),e=getStringFromHeap(a,c);fs.open(d,e,function(b,c){b?throwNodeError(a,b):a.asyncReturn(Long.fromNumber(c),null)})},a["fclose(J)V"]=function(a,b){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.close(b.toNumber(),function(b){b?throwNodeError(a,b):a.asyncReturn()})},a["link0(JJ)V"]=function(a,b,c){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["unlink0(J)V"]=function(a,b){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.unlink(getStringFromHeap(a,b),function(b){b?throwNodeError(a,b):a.asyncReturn()})},a["unlinkat0(IJI)V"]=function(a,b,c,d){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["mknod0(JIJ)V"]=function(a,b,c,d){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["rename0(JJ)V"]=function(a,b,c){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.rename(getStringFromHeap(a,b),getStringFromHeap(a,c),function(b){b?throwNodeError(a,b):a.asyncReturn()})},a["renameat0(IJIJ)V"]=function(a,b,c,d,e){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["mkdir0(JI)V"]=function(a,b,c){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.mkdir(getStringFromHeap(a,b),c,function(b){b?throwNodeError(a,b):a.asyncReturn()})},a["rmdir0(J)V"]=function(a,b){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.rmdir(getStringFromHeap(a,b),function(b){b?throwNodeError(a,b):a.asyncReturn()})},a["readlink0(J)[B"]=function(a,b){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.readlink(getStringFromHeap(a,b),function(b,c){b?throwNodeError(a,b):a.asyncReturn(util.initCarr(a.getBsCl(),c))})},a["realpath0(J)[B"]=function(a,b){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.realpath(getStringFromHeap(a,b),function(b,c){b?throwNodeError(a,b):a.asyncReturn(util.initCarr(a.getBsCl(),c))})},a["symlink0(JJ)V"]=function(a,b,c){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["stat0(JLsun/nio/fs/UnixFileAttributes;)V"]=function(a,b,c){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.stat(getStringFromHeap(a,b),function(b,d){b?throwNodeError(a,b):(convertStats(d,c),a.asyncReturn())})},a["lstat0(JLsun/nio/fs/UnixFileAttributes;)V"]=function(a,b,c){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.lstat(getStringFromHeap(a,b),function(b,d){b?throwNodeError(a,b):(convertStats(d,c),a.asyncReturn())})},a["fstat(ILsun/nio/fs/UnixFileAttributes;)V"]=function(a,b,c){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.fstat(b,function(b,d){b?throwNodeError(a,b):(convertStats(d,c),a.asyncReturn())})},a["fstatat0(IJILsun/nio/fs/UnixFileAttributes;)V"]=function(a,b,c,d,e){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["chown0(JII)V"]=function(a,b,c,d){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["lchown0(JII)V"]=function(a,b,c,d){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["fchown(III)V"]=function(a,b,c,d){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["chmod0(JI)V"]=function(a,b,c){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["fchmod(II)V"]=function(a,b,c){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["utimes0(JJJ)V"]=function(a,b,c,d){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["futimes(IJJ)V"]=function(a,b,c,d){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["opendir0(J)J"]=function(a,b){a.setStatus(ThreadStatus.ASYNC_WAITING),fs.readdir(getStringFromHeap(a,b),function(b,c){b?convertError(a,b,function(b){a.throwException(b)}):a.asyncReturn(Long.fromNumber(dirMap.newEntry(new DirFd(c))),null)})},a["fdopendir(I)J"]=function(a,b){return a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented."),null},a["closedir(J)V"]=function(a,b){dirMap.removeEntry(a,b.toNumber(),"Lsun/nio/fs/UnixException;")},a["readdir(J)[B"]=function(a,b){var c=dirMap.getEntry(a,"Lsun/nio/fs/UnixException;",b.toNumber());return c?stringToByteArray(a,c.next()):void 0},a["read(IJI)I"]=function(a,b,c,d){a.setStatus(ThreadStatus.ASYNC_WAITING);var e=a.getJVM().getHeap().get_buffer(c.toNumber(),d);fs.read(b,e,0,d,null,function(b,c){b?throwNodeError(a,b):a.asyncReturn(c)})},a["write(IJI)I"]=function(a,b,c,d){a.setStatus(ThreadStatus.ASYNC_WAITING);var e=a.getJVM().getHeap().get_buffer(c.toNumber(),d);fs.write(b,e,0,d,null,function(b,c){b?throwNodeError(a,b):a.asyncReturn(c)})},a["access0(JI)V"]=function(a,b,c){a.setStatus(ThreadStatus.ASYNC_WAITING);var d=getStringFromHeap(a,b),e=util.are_in_browser()?fs.stat:fs.access;e(d,function(b,c){b?throwNodeError(a,b):a.asyncReturn()})},a["getpwuid(I)[B"]=function(a,b){return util.initCarr(a.getBsCl(),"doppio")},a["getgrgid(I)[B"]=function(a,b){return util.initCarr(a.getBsCl(),"doppio")},a["getpwnam0(J)I"]=function(a,b){return a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented."),0},a["getgrnam0(J)I"]=function(a,b){return a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented."),0},a["statvfs0(JLsun/nio/fs/UnixFileStoreAttributes;)V"]=function(a,b,c){a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented.")},a["pathconf0(JI)J"]=function(a,b,c){return a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented."),null},a["fpathconf(II)J"]=function(a,b,c){return a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented."),null},a["strerror(I)[B"]=function(a,b){return a.throwNewException("Ljava/lang/UnsatisfiedLinkError;","Native method not implemented."),null},a["init()I"]=function(a){return 0},a}();registerNatives({"sun/nio/ch/FileChannelImpl":sun_nio_ch_FileChannelImpl,"sun/nio/ch/NativeThread":sun_nio_ch_NativeThread,"sun/nio/ch/IOUtil":sun_nio_ch_IOUtil,"sun/nio/ch/FileDispatcherImpl":sun_nio_ch_FileDispatcherImpl,"sun/nio/fs/UnixNativeDispatcher":sun_nio_fs_UnixNativeDispatcher});
//# sourceMappingURL=sun_nio.js.map