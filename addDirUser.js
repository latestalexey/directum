//
//
//

var $={Dir:{	// Global variable
 Server:'Dir9',		// Directum server
 DB:	'Directum'	// Directum database
}};

//goW();
$.doc=newDoc();
startPage();
clickWait();

changePage('connect');
$.window.startSpinner();
sysInit();
userList();
clickWait();

gatherData();
changePage('run');
Process();

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

function clickWait()
{
 $.window.Clicked=0;
 while(!$.closed && !$.window.Clicked) WScript.Sleep(300);
 if($.closed) WScript.Quit();
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

function sqlFetch(Class)
{
 var X=[];
 for(var Rs=$.SQL.Execute(); !Rs.EOF; Rs.MoveNext())
 {
  var r=Class? new Class : {};
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
  $.AD={Domain: (new ActiveXObject("ADSystemInfo")).DomainShortName};
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
  $.u=sqlFetch(iUser);
 });

 doIt('����� ������������� � AD', function()
 {
  for(var i in $.u)
  {
   var u=$.u[i];
   u.i=i;
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
  }
 });
}

function iUser(){}

function iUser.prototype.login()
{
 var Disabled=this.Depts.length?'': 'Disabled ';
 return '<Input Type="CheckBox" id="cb'+
    this.i+'" '+Disabled+' onClick="cbToggle(this)" />\n<Label For="cb'+
    this.i+'">'+html(this.UserLogin)+'</Label>';
}

function iUser.prototype.cn()
{
 var z=this.AD;
 if(!z) return '-';
 var S=html(z.cn);
 if(z.userAccountControl&2) S=S.strike();
 return '<A hRef="http://net.ekb.ru/omz/dc/user/?u='+
    escape(z.sAMAccountName)+'" Target="_blank">'+S+'</A>';
}

function iUser.prototype.tabNo()
{
 var n=this.AD.employeeId;
 return n? html(n) : '-';
}

function iUser.prototype.title()
{
 var t=this.AD.title;
 return t? html(t) : '?';
}

function iUser.prototype.deptNo()
{
 var d=this.Dept;
 return d? html(d) : '-';
}

function iUser.prototype.dept()
{
 var d=this.Depts;
 if(d.length<1) return '-';
 if(1==d.length) return html(d[0].NameAn);
 var S='<Select id="dept'+this.i+'">';
 for(var i in d)
  S+='<Option Value="'+d[i].Kod+'">'+html(d[i].NameAn);
 return S+'</Select>';
}

function userList()
{
 changePage('select');

 if(!$.Dir.Photo) return;
 var z=$.doc.getElementById('cbPhoto');
 z.disabled=0;
 z.checked=1;

 $.window.userList($.u);
}

// ������� ��������� �������� �� HTML
function gatherData()
{
 if($.Dir.Photo) $.Dir.Photo=$.doc.getElementById('cbPhoto').checked;
 $.Dir.genSQL=$.doc.getElementById('cbGen').checked;

 for(var i in $.u)
 {
  var u=$.u[i];
  u.Process=u.Depts.length && $.doc.getElementById('cb'+i).checked;
  u.selectedDept=u.Depts.length<2?
    0 : $.doc.getElementById('dept'+i).selectedIndex;
 }
}

function Process()
{
 var t=$.interior.getElementsByTagName('table')[0];

 for(var i in $.u)
 {
  var u=$.u[i];
  if(!u.Process) continue;
  var r=t.insertRow();
  r.insertCell().innerHTML=html(u.UserLogin);
  for(var j=1; j<=5; j++) r.insertCell().innerHTML='<BR />';
 }
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

Table	{
 width: 100%;

}

THead, TFoot {
 background:	white;
}

TH	{
 text-align: center;
}

.Even	{
 background: #CCCCEE;
}

.Odd	{
 background: #AAAACC;
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

function Click(B)
{
 B.disabled=true;
 window.Clicked=1;
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

function userList(List)
{
 var t=document.getElementById('Interior').
    getElementsByTagName('table')[0].tBodies[0];
 var N=0;
 for(var i in List)
 {
  var u=List[i];
  var r=t.insertRow(), c;
  r.className=i&1? 'Odd' : 'Even';

  (c=r.insertCell()).innerHTML=u.login();
  c.noWrap=1;
  (c=r.insertCell()).innerHTML=u.cn();
  if(!u.AD)
  {
   c.align='center';
   c.colSpan=5;
   continue;
  }
  (c=r.insertCell()).innerHTML=u.tabNo();
  c.align='right';
  r.insertCell().innerHTML=u.title();
  (c=r.insertCell()).innerHTML=u.deptNo();
  c.align='right';
  r.insertCell().innerHTML=u.dept();
  if(u.Depts.length)N++;
 }
 document.getElementById('numUsers').innerHTML=
    N==List.length?N:N+'/'+List.length;
}

function cbToggle(cb)
{
 if(cb) cb.blur();
 var X=document.getElementsByTagName('input');
 n=0;
 for(var i in X)
 {
  var z=X[i];
  if(/^cb\d+$/.test(z.id) && !z.disabled && z.checked) n++;
  if('button'==z.type) z.disabled=!n;
 }
}

function clickAll(cb)
{
 cb.blur();
 var X=document.getElementsByTagName('input');
 for(var i in X)
 {
  var z=X[i];
  if(/^cb\d+$/.test(z.id) && !z.disabled) z.checked=cb.checked;
 }
 cbToggle();
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
<Span>30</Span>
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
<Input Type='Button' Value=' ������! &gt;&gt; ' onClick='Click(this)' />
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

/*--[select]---------------------------------------------------------
<Table Border CellSpacing='0'>
<THead><TR>
<TH>�����</TH>
<TH>AD</TH>
<TH>���. �</TH>
<TH>���������</TH>
<TH>���</TH>
<TH>�����</TH>
</TR></THead>
<TBody></TBody>
<TFoot><TR>
<TD ColSpan='6'>
<Input Type="CheckBox" id="cb*" onClick="clickAll(this)"/>
<Label For="cb*">��� ���� [<Span id='numUsers'></Span>]</Label>
</TR></TFoot>
</Table>

<Table><TR><TD>
<Input Type="CheckBox" id="cbGen" Checked />
<Label For="cbGen">������������ SQL-�������������</Label>
<BR />
<Input Type="CheckBox" id="cbPhoto" Disabled />
<Label For="cbPhoto">���������� ����������</Label>

</TD><TD Align='Right' vAlign='Bottom'>
<Input Type="Button" Value="�������������! &gt;&gt;" Disabled
onClick="Click(this)" />
</TD></TR></Table>
-------------------------------------------------------------------*/

/*--[run]------------------------------------------------------------
<Table Border CellSpacing='0'>
<THead><TR>
<TH>������������</TH>
<TH Title='��������� ������������ SQL'>SQL</TH>
<TH Title='���������� ������������ Directum'>���</TH>
<TH Title='��������� �������'>���</TH>
<TH Title='��������� ���������'>���</TH>
<TH Title='��������� ��������'>���</TH>
</TR></THead>
<TBody></TBody>
</Table>
-------------------------------------------------------------------*/

//--[EOF]------------------------------------------------------------
