0</*! :: See https://github.com/ukoloff/directum
@echo off
cscript.exe //nologo //e:javascript "%~f0" %* Directum/Directum
goto :EOF */0;
!function(t){function n(r){if(e[r])return e[r].exports;var o=e[r]={exports:{},id:r,loaded:!1};return t[r].call(o.exports,o,o.exports,n),o.loaded=!0,o.exports}var e={};return n.m=t,n.c=e,n.p="",n(0)}([function(t,n,e){(function(t){t("�������� ����� �  Directum �� AD v1.0.0 <https://github.com/ukoloff/directum>\n"),e(44)}).call(n,e(2))},function(t,n){t.exports="undefined"!=typeof WScript&&null!==WScript?WScript:null},function(t,n,e){(function(n){t.exports=function(){return n.Echo([].slice.apply(arguments).join(" "))}}).call(n,e(1))},function(t,n){t.exports=new ActiveXObject("WScript.Shell")},function(t,n){t.exports=function(t,n){var e,r,o;for("function"!=typeof n&&(o=[]),r=0,e=new Enumerator(t);!e.atEnd();){if(o)o.push(e.item());else if(!1===n(e.item(),r++))return;e.moveNext()}return o}},function(t,n){t.exports=new ActiveXObject("Scripting.FileSystemObject")},function(t,n,e){(function(t){var n,e,r;e=this.h,this.connect=function(t,n){return this.h=e=new ActiveXObject("ADODB.Connection"),e.Provider="SQLOLEDB",e.Open("Integrated Security=SSPI;Data Source="+t),n&&r(n),e},this.use=r=function(t){return e.DefaultDatabase="["+t+"]"},this.command=function(t){var n;return n=new ActiveXObject("ADODB.Command"),n.ActiveConnection=e,n.CommandText=t,n},this.fields=n=function(n){var e;if(!n.EOF)return e={},t(n.Fields,function(t){e[t.name]=t.value}),e},this.execute=function(t,e){var r,o,i,c;for(o=0,"function"!=typeof e&&(i=[]),c=t.Execute();!c.EOF;)if(r=n(c),c.MoveNext(),i)i.push(r);else if(!1===e(r,o++))return;return i}}).call(n,e(4))},function(t,n){var e,r,o=[].slice;t.exports=r=new Function("o,k,v","o(k)=v"),r.a=e=function(t,n){var e,o,i,c;for(e=o=0,i=n.length;i>o;e=++o)c=n[e],r(t,e,c);return t},r.l=function(){var t,n;return n=arguments[0],t=2<=arguments.length?o.call(arguments,1):[],e(n,t)},r.o=function(t,n){var e,o,i,c;for(c=e=0,i=n.length;i>e;c=++e)o=n[c],r(t,o,c);return t}},function(t,n,e){(function(n){t.exports=function(t){return null==t&&(t=0),n.Quit(t)}}).call(n,e(1))},function(t,n,e){(function(n,e){t.exports=n(e.Arguments)}).call(n,e(4),e(1))},function(t,n){t.exports=function(t){var n,e;for(null==t&&(t=12),e="";e.length<t;)n=Math.floor(62*Math.random()),e+=String.fromCharCode("Aa0".charCodeAt(n/26)+n%26);return e}},function(t,n,e){(function(t,n){var e,r,o,i,c,u;c=o=u=e=i=this.h,this.connect=function(){return this.info=c=new ActiveXObject("ADSystemInfo"),this.dc=o=c.DomainShortName,this.rootDSE=u=GetObject("LDAP://rootDSE"),this.base=e=u.Get("rootDomainNamingContext"),this.h=i=new ActiveXObject("ADODB.Connection"),i.Provider="ADsDSOObject",i.Open("Active Directory Provider"),i},this.cmd=r=function(n){var e;return e=new ActiveXObject("ADODB.Command"),e.ActiveConnection=i,t.o(e.Properties,{"Page Size":1e3,Searchscope:2}),e.CommandText=n,e},this.user=function(t){var n;return n=r("<LDAP://"+e+">;(&(objectCategory=user)(sAMAccountName="+t.replace(/[()*\\]/g,"\\$&")+"));*;subTree").Execute(),n.EOF?void 0:GetObject(n(0).Value)},this.photo=function(t){var e,r;if(null!=t.thumbnailPhoto)t=t.thumbnailPhoto;else{if(null==t.jpegPhoto)return;t=t.jpegPhoto}return e=new ActiveXObject("ADODB.Stream"),e.Type=1,e.Open(),e.Write(t),e.SaveToFile(r=n(),2),e.Close(),r}}).call(n,e(7),e(14))},,function(t,n,e){(function(n,e,r,o){var i,c;i=function(){return n("������: "+e.ScriptName+" <Server>/<Database>\n\n��������: "+e.ScriptName+" Directum/Directum\n\n��������� ����� �������� � 3 ������ �����.\n\n����������� �� <https://github.com/ukoloff/directum>."),r(1)},t.exports=c=function(){var t,n,e;for(o.length||i(),t=0,n=o.length;n>t;t++)e=o[t],/^\w+\/\w+/.test(e)||i();return e=o[0].split("/"),{s:e[0],d:e[1]}}()}).call(n,e(2),e(1),e(8),e(9))},function(t,n,e){(function(n,e,r){var o;o=n.ExpandEnvironmentStrings("%TEMP%"),t.exports=function(){var t,n,i;for(t=n=1;16>=n;t=++n)if(!e.FileExists(i=e.BuildPath(o,r())))return i;throw Error("Cannot create temporary file")}}).call(n,e(3),e(5),e(10))},function(t,n){var e,r,o,i;i=o=e=0,this.init=r=function(){return this.lp=o=new ActiveXObject("SBLogon.LoginPoint")},this.connect=function(t,n){return o||r(),this.app=e=o.GetApplication("ServerName="+t+";DBName="+n+";IsOSAuth=1")},this.photo=function(t,n){var e;if(n)return e=t.Requisites("�����"),e.LoadFromFile(n),e.Extension="jpg",t.�����="��"}},,,,,,,,,,,,,,,,,,,,,,,,,,,,,function(t,n,e){(function(t,n,e,r,o,i){var c;t("����������� � mssql://"+n.s+"/"+n.d),e.connect(n.s,n.d),t("����������� � Active Directory"),r.connect(),t("����������� � Directum"),o.connect(n.s,n.d),t("��������� ����"),c=e.command("Select Distinct\n  Lgn.UserLogin, Prs.Analit\nFrom\n  MBAnalit As Wrk,\n  MBAnalit As Prs,\n  MBAnalit As Usr,\n  MBUser As Lgn\nWhere Wrk.Vid=(Select Vid From MBVidAn Where Kod='���')\n  And Wrk.Persona=Prs.Analit And Wrk.Polzovatel=Usr.Analit\n  And Usr.Dop=Lgn.UserKod\n  And Lgn.UserType='�' And Lgn.NeedEncode='W'\nOrder By 1"),e.execute(c,function(n){var e,c,u;if((u=r.user(n.UserLogin))&&(c=r.photo(u)))return t(n.UserLogin),e=o.app.ReferencesFactory.���.GetObjectById(n.Analit),o.photo(e,c),e.Save(),i.DeleteFile(c)}),t("That's all folks!")}).call(n,e(2),e(13),e(6),e(11),e(15),e(5))}]);