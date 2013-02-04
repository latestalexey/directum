//
//
//

var $={Dir:{			// Global variable
    Server: 'Dir9',		// Directum server
    DB: 	'Directum'	// Directum database
}};

//goW();
$.doc=newDoc();
startPage();

while(!$.closed && !$.window.welcome) WScript.Sleep(300);

if($.closed) WScript.Quit();

changePage('connect');
$.window.startSpinner();
sysInit();
countDown();

//--[Functions]

// ��������������� � wscript (������ �������)
function goW()
{
 WScript.Interactive=false;

 if(WScript.FullName.replace(/^.*[\/\\]/, '').match(/^w/i)) return;
 (new ActiveXObject("WScript.Shell")).Run('wscript //B "'+
    WScript.ScriptFullName+'"', 0, false);
 WScript.Quit();
}

// ���������� ����������� � HTML-����
function html(S)
{
 S=''+S;
 var E={'&':'amp', '>':'gt', '<':'lt', '"':'quot'};
 for(var Z in E)
   S=S.split(Z).join('&'+E[Z]+';');
 return S;
}

// ������� MSIE
function newDoc()
{
 var ie=WScript.CreateObject('InternetExplorer.Application');
 ie.AddressBar=false;
 ie.StatusBar=false;
 ie.ToolBar=false;
 ie.MenuBar=false;
 ie.Visible=true;
 ie.Navigate('about:blank');
 while(ie.Busy) WScript.Sleep(100);
 $.ie=ie;
 return ie.Document;
}

// ������� ��������� ��������
function startPage()
{
 $.doc.open();
 $.doc.write(readSnippet('html'));
 $.doc.close();

 $.window=$.doc.parentWindow;
 $.doc.body.onunload=function(){ $.closed=1; }
 $.interior=$.doc.getElementById('Interior');
}

// �������� ������� ������ �� ��������� ����
function readSnippet(name)
{
 var f=WScript.CreateObject("Scripting.FileSystemObject").
    OpenTextFile(WScript.ScriptFullName, 1);	//ForReading
 var on, R='';
 while(!f.AtEndOfStream)
 {
  var s=f.ReadLine();
  if(!on)
  {
   if(s.match(/^\s*\/\*[-\s]*\[([.\w]+)\][-\s]+$/i) && (RegExp.$1==name)) on=1;
   continue;
  }
  if(s.match(/^[-\s]+\*\/\s*$/)) break;
  R+=s+'\n';
 }
 f.Close();
 return R;
}

// ��������� �������� ������ �� �������� ����
function countDown()
{
 $.window.countDown($.ie);
 WScript.Quit();
}

// ��������� ���� ��� �������������
function doIt(Name, Fun)
{
 if(!$.stepN)$.stepN=1;

 var S=$.window.newStep();
 var t=$.interior.getElementsByTagName('table')[0];
 var r=t.insertRow();
 var c=r.insertCell();
 c.innerHTML=($.stepN++)+'. '+Name;
 c.noWrap=1;
 (S.Time=r.insertCell()).innerHTML='0.0';
 S.Time.align='Right';
 (S.Res=r.insertCell()).innerHTML='<BR />';
 $.window.Step=S;

 function updTime(Txt)
 {
  S.Res.innerHTML=Txt;
  $.window.Step=0;
  S.Time.innerHTML=(((new Date()).getTime()-S.ctime.getTime())/1000).toFixed(3);
 }

 try{ 
  Fun();
 }catch(e)
 {
  updTime(e.description);
  countDown();
 }
 if($.closed) WScript.Quit();
 updTime('Ok');
}

// ����������� ���������� ���� �� �����
function changePage(N)
{
 $.interior.innerHTML=readSnippet(N);
}

function sqlFetch()
{
 var X=[];
 for(var Rs=$.SQL.Execute(); !Rs.EOF; Rs.MoveNext())
 {
  var r={};
  for(var E=new Enumerator(Rs.Fields); !E.atEnd(); E.moveNext())
   r[E.item().name]=E.item().value;
  X.push(r);
 }
 return X;
}

// ����� ������������ �� ����� � AD � ������� ��� ��� ������
function u2obj(u)
{
 $.AD.cmd.CommandText="<LDAP://"+$.AD.baseDN+
    ">;(&(objectCategory=user)(sAMAccountName="+
    u.replace(/[()*\\]/g, '\\$&')+"));*;subTree";
 var Rs=$.AD.cmd.Execute();
 if(!Rs.EOF) return GetObject(Rs(0).Value);
}

// ����� ��� ������������� ������������ AD
function depID(user)
{
 if(!user) return;
 while(user=GetObject(user.Parent))
 {
  if(!user.ou) return;
  var i=user.l;
  if(!i) continue;
  if(!i.match(/^\d+$/)) return;
  return i;
 }
}

// ����� ��� ������������� � ��������� �����
function findDepts(depId)
{
/*--[Depts.sql]------------------------------------------------------
Select
 Dep.Kod, Dep.NameAn
From
 MBVidAn As Z, MBAnalit As Dep
Where
 Z.Kod='���' And Z.Vid=Dep.Vid And Dep.NomPodr=? 
Order By 2
-------------------------------------------------------------------*/
 $.SQL.CommandText=readSnippet('Depts.sql');
 $.SQL(0)=depId;
 return sqlFetch();
}

// ������������ �� ���� ��
function sysInit()
{
 var lp, SQL;
 doIt('������������� ������� Directum', function()
 { lp=new ActiveXObject("SBLogon.LoginPoint"); });

 doIt('����������� � ������� Directum', function()
 {
  $.Dir.App=lp.GetApplication("ServerName="+$.Dir.Server+
    ";DBName="+$.Dir.DB+";IsOSAuth=1");
 });

 doIt('�������� ��������� ����������', function()
 {
  $.Dir.Photo=!!$.Dir.App.ReferencesFactory.���.
    GetComponent().FindRequisite('�����');
 });

 doIt('����������� � ������� MS SQL', function()
 {
  SQL=new ActiveXObject("ADODB.Connection");
  SQL.Provider='SQLOLEDB';
  SQL.Open("Integrated Security=SSPI;Data Source="+$.Dir.Server);
  $.SQL=new ActiveXObject("ADODB.Command");
  $.SQL.ActiveConnection=SQL;
 });

 doIt('����� ���� ������ MS SQL', function()
 {
  SQL.DefaultDatabase='['+$.Dir.DB+']';
 });

 doIt('����������� � Active Directory', function()
 {
  $.AD={};
  $.AD.rootDSE=GetObject("LDAP://rootDSE");
  $.AD.baseDN=$.AD.rootDSE.Get('rootDomainNamingContext');

  $.AD.h=new ActiveXObject("ADODB.Connection");
  $.AD.h.Provider = "ADsDSOObject";
  $.AD.h.Open("Active Directory Provider");

  $.AD.cmd=new ActiveXObject("ADODB.Command");
  $.AD.cmd.ActiveConnection=$.AD.h;
  $.AD.cmd.Properties("Page Size")=1000;
  $.AD.cmd.Properties("Searchscope")=2; // ADS_SCOPE_SUBTREE
 });

 doIt('����� ������������� Directum', function()
 {
/*--[user.sql]-------------------------------------------------------
Select U.Analit, U.Kod, X.UserKod, X.UserLogin, X.UserName
From MBAnalit As U, MBUser As X
Where
 U.Vid=(Select Vid from MBVidAn Where Kod='���')
 And U.Dop=X.UserKod
 And X.UserStatus<>'�' And X.UserType='�'
 And X.UserCategory='�' And X.NeedEncode='W'
 And U.Analit not In
    (Select Polzovatel From MBAnalit Where
     Polzovatel is not Null
     And Vid=(Select Vid from MBVidAn Where Kod='���'))
-------------------------------------------------------------------*/
  $.SQL.CommandText=readSnippet('user.sql');
  $.u=sqlFetch();
 });

 doIt('����� ������������� � AD', function()
 {
  for(var i in $.u)
  {
   var u=$.u[i];
   u.AD=u2obj(u.UserLogin);
  }
 });

 doIt('����� �������������', function()
 {
  for(var i in $.u)
  {
   var u=$.u[i];
   u.Dept=depID(u.AD);
   u.Depts=u.Dept? findDepts(u.Dept) : [];
   WScript.Echo(u.UserKod, u.UserName, u.AD? u.AD.displayName:'-', u.Dept, u.Depts.length);
  }
 });

}

//--[Snippets]

/*--[html]-----------------------------------------------------------
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01//EN" "http://www.w3.org/TR/html4/strict.dtd">
<html><head>
<meta http-equiv="Content-Type" content="text/html; charset=windows-1251">
<title>�������������� ��������� ������, ���������� � ���������</title>

<style>

body	{
 background:	#A0C0E0 URL(about:blank) no-repeat fixed;
 margin:	0;
 padding:	0.3ex;
 color:		black;
 font-family:	Verdana, Arial, sans-serif;
 text-align:	justify;
}

#Footer {
 position: fixed;
 bottom: 0;
 left: 0;
 width: 100%;
 font-size: 87%;
 white-space:nowrap;
 border-top: 1px dashed navy;
}

* html #Footer {
 position: absolute;
 left: expression(eval(document.documentElement.scrollLeft));
 width: expression(eval(document.documentElement.clientWidth));
 top: expression(document.documentElement.clientHeight-this.offsetHeight+document.documentElement.scrollTop); 
 background: lime;
}

#C {
 background:	#B0D0F0;
}

#D {
 display:	none;
 background:	yellow;
 text-align:	center;
}

.Flip #C {
 display:	none;
}

.Flip #D {
 display:	block;
}

H1	{
 text-align:	right;
}

#pg1Btn {
 text-align:	right;
}

THead, TFoot {
 background:	white;
}

#Spinner {
 text-align:	center;
 padding:	0.3ex;
}

#Spinner Span {
 padding:	0 0.5ex;
 margin:	0 0.2ex;
 x-width:	1ex;
 border:	1px solid #EEEEEE;
}

</style>

<script>

function Welcome(B)
{
 B.disabled=true;
 window.welcome=1;
}

function startSpinner()
{
 var S='';
 for(var i=0; i<9; i++) S+='<Span>&nbsp;</Span>';
 var z=document.getElementById('Spinner');
 z.innerHTML=S;
 z=z.children;
 var N=0;
 var ntr=setInterval(function()
 {
  N++;
  var z=document.getElementById('Spinner');
  if(!z) return clearInterval(ntr);
  z=z.children;
  var L=z.length;
  var X=Math.round((Math.sin(N/3)/2+0.5)*L);
  for(var i=L-1; i>=0; i--)
  {
   var C=Math.round(Math.sqrt(Math.abs((i-X)/L))*255).toString(16);
   if(1==C.length)C='0'+C;
   z[i].style.borderColor='#'+C+C+C;
  }
  if(window.Step) window.Step.Time.innerHTML=
    (((new Date()).getTime()-window.Step.ctime.getTime())/1000).toFixed(1);
 }, 50);
}
 
function stopSpinner()
{
 var z=document.getElementById('Spinner');
 if(z) z.parentElement.removeChild(z);
}

function countDown(ie)
{
 stopSpinner();
 var z=document.getElementById('D');
 z.parentElement.className='Flip';
 z.getElementsByTagName('A')[0].onclick=function()
 {
  this.blur();
  clearInterval(ntr);
  z.parentElement.className='';
  return false;
 }
 var q=z.getElementsByTagName('span')[0];
 var Stop=(new Date()).getTime()+q.innerHTML*1000;
 var ntr=setInterval(function(){
  var n=Math.ceil((Stop-(new Date()).getTime())/1000);
  q.innerHTML=n;
  if(n>0) return;
  clearInterval(ntr);
  ie.Quit();
 }, 100);
}

function newStep()
{
 return {ctime: new Date()};
}

// ����� �� ������ "������"
setTimeout(function()
{
 document.getElementsByTagName('input')[0].focus();
}, 0);

</script>

</head><body>
<Div id='Footer'>
<Div id='C'>
&copy; ��� "<A hRef='http://ekb.ru' Target='_blank'
onClick='this.blur()'>����������</A>", 2013
</Div>
<Div id='D'><A hRef='#'>��������</A> �������� ���� �����
<Span>10</Span>
�
</Div>
</Div>
<H1>��������� ������������� Directum
</H1>

<Div id='Interior'>
��� ��������� �������� � �������������� ���������� �������������
������� ������������ ���������������� "Directum". ������ ������, ���:
<UL>
<LI>������ ������ � ������������ ������� � ���������
<LI>��������� ������ � ������������ ������������ � �������� �� Active Directory
<LI>���������� ������������� SQL
</UL>
<Div id='pg1Btn'>
<Input Type='Button' Value=' ������! &gt;&gt; ' onClick='Welcome(this)' />
</Div>
<HR />
������������� ��������� ������� � ����� Directum:
<OL>
<LI>�������� �������� "������������"
<LI>�������� ����� ������ (Ctrl+N)
<LI>������� ��� (������� ������ � ������)
<LI>������� �����-������ ������ ��� (����� �� �� ������� ������)
<LI>���������, ��� ������� "Windows-��������������"
<LI>���������, ��� ������ ������������ �� "��������"
<LI>������������� ���� � ��������� ������ "������"
</OL>
<Center>�����!</Center>

</Div>

<Div><BR /></Div>
</body></html>
-------------------------------------------------------------------*/

/*--[connect]--------------------------------------------------------
<Table Border CellSpacing='0'>
<THead><TR><TH>��������</TH>
<TH>�����</TH>
<TH Width='100%'>���������</TH>
</TR></THead>
<TBody></TBody>
</Table>

<Div id='Spinner'></Div>
</Div>
-------------------------------------------------------------------*/

//--[EOF]------------------------------------------------------------
