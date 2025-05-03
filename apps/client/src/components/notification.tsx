interface Props {
    inviterId: string
    onAccept: () => void
    onReject: () => void
  }
  
  const Notification: React.FC<Props> = ({ inviterId, onAccept, onReject }) => {
    return (
      <div className="bg-white shadow-md rounded p-4 text-center">
        <p className="mb-4 font-medium">Пользователь {inviterId} хочет с вами пообщаться</p>
        <div className="flex gap-4 justify-center">
          <button onClick={onAccept} className="bg-green-500 text-white px-4 py-2 rounded">
            Принять
          </button>
          <button onClick={onReject} className="bg-red-500 text-white px-4 py-2 rounded">
            Отклонить
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-500">Автоотмена через 15 сек...</p>
      </div>
    )
  }
  
  export default Notification
  