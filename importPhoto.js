//
// Import user photo from AD to Directum
//

var $={Dir:{	// Global variable
 Server:'Dir9',		// Directum server
 DB:	'Directum'	// Directum database
}};



//--[Functions]

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

function readUser()
{
/*--[List]-----------------------------------------------------------
Select 
 Lgn.UserLogin, Prs.Analit
From
 MBAnalit As Wrk,
 MBAnalit As Prs,
 MBAnalit As Usr,
 MBUser As Lgn
Where Wrk.Vid=(Select Vid From MBVidAn Where Kod='���')
 And Wrk.Persona=Prs.Analit And Wrk.Polzovatel=Usr.Analit
 And Usr.Dop=Lgn.UserLogin
 And Lgn.UserType='�' And Lgn.NeedEncode='W'
Order By 1 
-------------------------------------------------------------------*/
}

//--[EOF]------------------------------------------------------------
