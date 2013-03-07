
// ������ ��� �������������� ��������� �������, ��������� � ��������

var user='grehova';
var Generate=1;		// ������������ ������������ SQL

var Server='Directum';
var DB='Directum';

WScript.Echo("����� ������������ '"+user+"' � Active Directory...");
var adU=getUser(user);
if(!adU) Abort("������������ �� ������!");
user=adU.sAMAccountName;			// ������������ ��� ������������
WScript.Echo("���������� � Directum...");
var D=goDirectum();
WScript.Echo("���������� � SQL...");
var Q=goSQL();
var Cmd=new ActiveXObject("ADODB.Command");
var Rs;
Cmd.ActiveConnection=Q;

WScript.Echo("����� ������������ '"+user+"' � Directum");
Cmd.CommandText="Select Usr.Analit, Usr.Kod From MBVidAn As Z, MBAnalit As Usr " +
    "Where Z.Kod='���' And Z.Vid=Usr.Vid And Dop=?";
Cmd(0)=user;
Rs=Cmd.Execute();
if(Rs.EOF) Abort("������������ �� ������!");
var uID=Rs(0).Value;
var uKod=Rs(1).Value;

if(Generate)
{
 WScript.Echo("��������� ������������ '"+user+"' � SQL");
 var e;
 try{ Q.sp_grantlogin("LAN\\"+user);    }catch(e){};
 try{ Q.sp_adduser("LAN\\"+user, user); }catch(e){};
}

WScript.Echo("����� ��������� � Directum");
Cmd.CommandText="Select Wrk.Analit From MBVidAn As Z, MBAnalit As Wrk "+
    "Where Z.Kod='���' And Z.Vid=Wrk.Vid And Wrk.Polzovatel=?"
Cmd(0)=uID;
Rs=Cmd.Execute();
if(!Rs.EOF) Abort("�������� ��� ����������!");

WScript.Echo("����� ������������� � Directum");
Cmd.CommandText="Select Dep.Kod, Dep.NameAn From MBVidAn As Z, MBAnalit As Dep "+
    "Where Z.Kod='���' And Z.Vid=Dep.Vid And Dep.NomPodr=? ";
Cmd(0)=depID(adU);
Rs=Cmd.Execute();
if(Rs.EOF) Abort("������������� �� �������!");
var depKod=Rs(0).Value;
WScript.Echo('�������������='+Rs(1));

WScript.Echo("���������� �������");
//WScript.Quit();
var Prs=D.ReferencesFactory.���.GetComponent();
Prs.Open();
Prs.Insert();
Prs.����������=adU.sn;		//�������
Prs.����������2=adU.givenName;	//���
Prs.����������3=adU.middleName;	//��������
Prs.������2=adU.mail;		//������ e-mail
Prs.Save();

WScript.Echo("���������� ���������");
var Wrk=D.ReferencesFactory.���.GetComponent();
Wrk.Open();
Wrk.Insert();
Wrk.�������=Prs.���;
Wrk.������������=uKod;
Wrk.�������������=depKod;
Wrk.������=adU.title;		//���������
Wrk.����������4=adU.telephoneNumber;
Wrk.����������3=adU.employeeID	//��������� �����
Wrk.����������=adU.sn+' '+adU.givenName+' '+adU.middleName; //������� �.�.
Wrk.Save();

WScript.Echo("���������� ���� E-mail � ��������");
var Knt=D.ReferencesFactory.���.GetComponent();
Knt.Open();
if(!Knt.Locate('�������', Prs.���)) 
  WScript.Echo("������� �� ������! :-(");
else
{
  Knt.������2=adU.mail;		//������ e-mail
  Knt.Save();
}

WScript.Echo("������!");

function goDirectum()
{
 var lp=new ActiveXObject("SBLogon.LoginPoint");
 var D=lp.GetApplication("ServerName="+Server+";DBName="+DB+";IsOSAuth=1");
 return D;
}

function goSQL()
{
 var Conn=new ActiveXObject("ADODB.Connection");
 Conn.Provider='SQLOLEDB';
 Conn.Open("Integrated Security=SSPI;Data Source="+Server);
 Conn.DefaultDatabase=DB;
 return Conn;
}

function getUser(u)
{
 var ADS_SCOPE_SUBTREE = 2;

 var Conn=new ActiveXObject("ADODB.Connection");
 var Cmd=new ActiveXObject("ADODB.Command");
 Conn.Provider = "ADsDSOObject";
 Conn.Open("Active Directory Provider");
 Cmd.ActiveConnection=Conn;

 Cmd.Properties("Page Size")=1000;
 Cmd.Properties("Searchscope")=ADS_SCOPE_SUBTREE;

 Cmd.CommandText=
     "SELECT * FROM 'LDAP://dc=lan,dc=uxm' WHERE objectCategory='user' "+
     "And sAMAccountName='"+u.replace("'", "")+"'";
 var Rs=Cmd.Execute();
 if(Rs.EOF) return;
 return GetObject(Rs.Fields(0).Value);
}

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

function Abort(S)
{
 WScript.Echo(S);
 WScript.Quit();
}

//--[EOF]--------------------------------------------------------------------
