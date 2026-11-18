# Speaks a French text into a WAV file with a voice installed in Windows
# (free, offline). The voice is one of the Windows « OneCore » voices.
#
#   powershell -File marketing/video/tts.ps1 -Text "Bonjour" -Out voix.wav -Voice Paul
param(
  [Parameter(Mandatory = $true)][string]$Text,
  [Parameter(Mandatory = $true)][string]$Out,
  [string]$Voice = "Paul",
  [double]$Rate = 1.05
)

Add-Type -AssemblyName System.Runtime.WindowsRuntime
$null = [Windows.Media.SpeechSynthesis.SpeechSynthesizer, Windows.Media, ContentType = WindowsRuntime]
$null = [Windows.Storage.Streams.DataReader, Windows.Storage.Streams, ContentType = WindowsRuntime]

# WinRT calls are asynchronous: wait for them from PowerShell.
$asTask = [System.WindowsRuntimeSystemExtensions].GetMethods() |
  Where-Object { $_.Name -eq "AsTask" -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq "IAsyncOperation``1" } |
  Select-Object -First 1
function Await($operation, [Type]$type) {
  $task = $asTask.MakeGenericMethod($type).Invoke($null, @($operation))
  $task.Wait() | Out-Null
  $task.Result
}

$synth = New-Object Windows.Media.SpeechSynthesis.SpeechSynthesizer
$chosen = [Windows.Media.SpeechSynthesis.SpeechSynthesizer]::AllVoices |
  Where-Object { $_.Language -like "fr-*" -and $_.DisplayName -like "*$Voice*" } |
  Select-Object -First 1
if (-not $chosen) { throw "Voix française « $Voice » introuvable" }
$synth.Voice = $chosen
$synth.Options.SpeakingRate = $Rate

$stream = Await ($synth.SynthesizeTextToStreamAsync($Text)) ([Windows.Media.SpeechSynthesis.SpeechSynthesisStream])
$reader = New-Object Windows.Storage.Streams.DataReader($stream.GetInputStreamAt(0))
$size = [uint32]$stream.Size
$null = Await ($reader.LoadAsync($size)) ([uint32])
$bytes = New-Object byte[] $size
$reader.ReadBytes($bytes)
[System.IO.File]::WriteAllBytes($Out, $bytes)
"$Out ($($chosen.DisplayName), $size octets)"
