export function parseJSON(text: string): any {
	try {
		const parsed = JSON.parse(text);
		return parsed;
	} catch (error) {
		// SyntaxError: Bad control character in string literalが起きる
		// 多分文字コードだと思う
		// JSZipはUTF-8を期待するがShift-JISが入ってるかも
		// どうハンドリングしたらいいかわからないので握りつぶしとく
		console.log('an error occurred: ' + error);
	}
}
