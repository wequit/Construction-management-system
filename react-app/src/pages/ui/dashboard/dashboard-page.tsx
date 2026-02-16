import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-[#0b1020] text-white pb-20">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Дашборд</h1>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Ключевые показатели</h2>
          <div className="grid grid-cols-2 gap-3">
            <Card className="bg-[#0f1729] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Заявки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">38</div>
                <div className="space-y-1">
                  <Badge variant="outline" className="text-xs px-2 py-0.5 border-yellow-600 text-yellow-500">
                    12 на согласовании
                  </Badge>
                  <br />
                  <Badge variant="destructive" className="text-xs px-2 py-0.5">
                    5 просрочено
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1729] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Договора</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">14</div>
                <Badge variant="outline" className="text-xs px-2 py-0.5 border-blue-600 text-blue-400">
                  3 требуют продления
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1729] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Сметы</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">27</div>
                <Badge variant="outline" className="text-xs px-2 py-0.5 border-blue-600 text-blue-400">
                  6 на проверке
                </Badge>
              </CardContent>
            </Card>

            <Card className="bg-[#0f1729] border-gray-800">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-gray-400">Материалы / остатки</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-2">1284</div>
                <div className="space-y-1">
                  <Badge variant="destructive" className="text-xs px-2 py-0.5">
                    18 дефицит
                  </Badge>
                  <br />
                  <Badge variant="default" className="text-xs px-2 py-0.5 bg-green-600">
                    в норме 92%
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Эффективность реализации проектов</h2>
          
          <Card className="bg-[#0f1729] border-gray-800 mb-3">
            <CardContent className="pt-4">
              <div className="text-4xl font-bold text-blue-400 mb-2">78%</div>
              <p className="text-sm text-gray-300 mb-3">Факт / План расходов</p>
              <Progress value={78} className="h-2" indicatorClassName="bg-blue-500" />
              <p className="text-xs text-gray-400 mt-2">Соотношение факт. расходов к плановым</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1729] border-gray-800 mb-3">
            <CardContent className="pt-4">
              <div className="text-4xl font-bold text-green-400 mb-2">92%</div>
              <p className="text-sm text-gray-300 mb-3">Задачи в срок</p>
              <Progress value={92} className="h-2" indicatorClassName="bg-green-500" />
              <p className="text-xs text-gray-400 mt-2">Процент задач, выполненных в срок</p>
            </CardContent>
          </Card>

          <Card className="bg-[#0f1729] border-gray-800 mb-3">
            <CardContent className="pt-4">
              <div className="text-4xl font-bold text-yellow-400 mb-2">45%</div>
              <p className="text-sm text-gray-300 mb-3">Закрытые акты (КС-2/3)</p>
              <Progress value={45} className="h-2" indicatorClassName="bg-yellow-500" />
              <p className="text-xs text-gray-400 mt-2">% закрытых актов от общего объема</p>
            </CardContent>
          </Card>
        </section>

       
      </div>
    </div>
  )
}
